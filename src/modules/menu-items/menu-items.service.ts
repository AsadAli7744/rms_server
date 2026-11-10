import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { ItemVariant } from './entities/item-variant.entity';
import { ItemAddonGroup } from './entities/item-addon-group.entity';
import { ItemAddonOption } from './entities/item-addon-option.entity';
import { MenuCategory } from '../menu-categories/entities/menu-category.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { QueryMenuItemDto } from './dto/query-menu-item.dto';
import { CreateItemVariantDto } from './dto/create-item-variant.dto';
import { CreateItemAddonGroupDto } from './dto/create-item-addon-group.dto';
import { CreateItemAddonOptionDto } from './dto/create-item-addon-option.dto';
import { PurchaseStockDto } from './dto/purchase-stock.dto';
import { normalizePagination } from '../../common/shared/utils/pagination.util';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly itemRepo: Repository<MenuItem>,
    @InjectRepository(MenuCategory)
    private readonly categoryRepo: Repository<MenuCategory>,
    @InjectRepository(ItemVariant)
    private readonly variantRepo: Repository<ItemVariant>,
    @InjectRepository(ItemAddonGroup)
    private readonly groupRepo: Repository<ItemAddonGroup>,
    @InjectRepository(ItemAddonOption)
    private readonly optionRepo: Repository<ItemAddonOption>,
  ) {}

  async createItem(dto: CreateMenuItemDto, actorId?: number | null) {
    await this.assertCategory(dto.category_id, dto.restaurant_id);
    const exists = await this.itemRepo.exist({
      where: {
        restaurant_id: dto.restaurant_id,
        slug: dto.slug,
        is_archived: false,
      },
    });
    if (exists) {
      throw new ConflictException(`Item slug "${dto.slug}" already exists`);
    }
    const row = this.itemRepo.create({
      restaurant_id: dto.restaurant_id,
      category_id: dto.category_id,
      name: dto.name,
      slug: dto.slug,
      short_description: dto.short_description ?? null,
      full_description: dto.full_description ?? null,
      image_url: dto.image_url ?? null,
      item_type: dto.item_type,
      base_price: dto.base_price,
      sku: dto.sku ?? null,
      preparation_station_type: dto.preparation_station_type,
      is_featured: dto.is_featured ?? false,
      is_spicy: dto.is_spicy ?? false,
      is_veg: dto.is_veg ?? false,
      is_halal: dto.is_halal ?? false,
      is_active: dto.is_active ?? true,
      track_stock: dto.track_stock ?? true,
      stock_quantity: dto.track_stock === false ? 0 : (dto.stock_quantity ?? 50),
      low_stock_threshold: dto.low_stock_threshold ?? 10,
      availability_type: dto.availability_type,
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    });
    return this.itemRepo.save(row);
  }

  async findAllItems(query: QueryMenuItemDto) {
    const { page, limit, skip } = normalizePagination(query);
    const qb = this.itemRepo.createQueryBuilder('i');
    if (!query.include_archived) {
      qb.andWhere('i.is_archived = false');
    }
    if (query.restaurant_id != null) {
      qb.andWhere('i.restaurant_id = :rid', { rid: query.restaurant_id });
    }
    if (query.category_id != null) {
      qb.andWhere('i.category_id = :cid', { cid: query.category_id });
    }
    qb.orderBy('i.id', 'ASC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOneItem(id: number) {
    const row = await this.itemRepo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Menu item ${id} not found`);
    }
    return row;
  }

  async updateItem(id: number, dto: UpdateMenuItemDto, actorId?: number | null) {
    const row = await this.findOneItem(id);
    if (dto.category_id != null) {
      await this.assertCategory(dto.category_id, row.restaurant_id);
    }
    if (dto.slug && dto.slug !== row.slug) {
      const exists = await this.itemRepo.exist({
        where: {
          restaurant_id: row.restaurant_id,
          slug: dto.slug,
          is_archived: false,
        },
      });
      if (exists) {
        throw new ConflictException(`Item slug "${dto.slug}" already exists`);
      }
    }
    Object.assign(row, dto, { updated_by: actorId ?? null });
    return this.itemRepo.save(row);
  }

  async archiveItem(id: number, actorId?: number | null) {
    const row = await this.findOneItem(id);
    row.is_archived = true;
    row.updated_by = actorId ?? null;
    return this.itemRepo.save(row);
  }

  async purchaseStock(dto: PurchaseStockDto, actorId?: number | null) {
    const item = await this.findOneItem(dto.item_id);
    item.stock_quantity = (item.stock_quantity ?? 0) + Number(dto.quantity);
    if (actorId) {
      item.updated_by = actorId;
    }
    return this.itemRepo.save(item);
  }

  async listVariants(itemId: number) {
    await this.findOneItem(itemId);
    return this.variantRepo.find({
      where: { item_id: itemId, is_archived: false },
      order: { sort_order: 'ASC', id: 'ASC' },
    });
  }

  async createVariant(
    itemId: number,
    dto: CreateItemVariantDto,
    actorId?: number | null,
  ) {
    await this.findOneItem(itemId);
    const row = this.variantRepo.create({
      item_id: itemId,
      name: dto.name,
      sku: dto.sku ?? null,
      price_adjustment: dto.price_adjustment ?? 0,
      override_price: dto.override_price ?? null,
      sort_order: dto.sort_order ?? 0,
      is_active: dto.is_active ?? true,
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    });
    return this.variantRepo.save(row);
  }

  async updateVariant(
    variantId: number,
    patch: Partial<CreateItemVariantDto>,
    actorId?: number | null,
  ) {
    const row = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!row) {
      throw new NotFoundException(`Variant ${variantId} not found`);
    }
    Object.assign(row, patch, { updated_by: actorId ?? null });
    return this.variantRepo.save(row);
  }

  async archiveVariant(variantId: number, actorId?: number | null) {
    const row = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!row) {
      throw new NotFoundException(`Variant ${variantId} not found`);
    }
    row.is_archived = true;
    row.updated_by = actorId ?? null;
    return this.variantRepo.save(row);
  }

  async listAddonGroups(itemId: number) {
    await this.findOneItem(itemId);
    return this.groupRepo
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.options', 'o', 'o.is_archived = false')
      .where('g.item_id = :iid', { iid: itemId })
      .andWhere('g.is_archived = false')
      .orderBy('g.sort_order', 'ASC')
      .addOrderBy('g.id', 'ASC')
      .addOrderBy('o.sort_order', 'ASC')
      .getMany();
  }

  async createAddonGroup(
    itemId: number,
    dto: CreateItemAddonGroupDto,
    actorId?: number | null,
  ) {
    await this.findOneItem(itemId);
    const row = this.groupRepo.create({
      item_id: itemId,
      title: dto.title,
      selection_type: dto.selection_type,
      min_selection: dto.min_selection ?? 0,
      max_selection: dto.max_selection ?? null,
      is_required: dto.is_required ?? false,
      sort_order: dto.sort_order ?? 0,
      is_active: dto.is_active ?? true,
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    });
    return this.groupRepo.save(row);
  }

  async updateAddonGroup(
    groupId: number,
    patch: Partial<CreateItemAddonGroupDto>,
    actorId?: number | null,
  ) {
    const row = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!row) {
      throw new NotFoundException(`Add-on group ${groupId} not found`);
    }
    Object.assign(row, patch, { updated_by: actorId ?? null });
    return this.groupRepo.save(row);
  }

  async archiveAddonGroup(groupId: number, actorId?: number | null) {
    const row = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!row) {
      throw new NotFoundException(`Add-on group ${groupId} not found`);
    }
    row.is_archived = true;
    row.updated_by = actorId ?? null;
    return this.groupRepo.save(row);
  }

  async listAddonOptions(groupId: number) {
    const g = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!g) {
      throw new NotFoundException(`Add-on group ${groupId} not found`);
    }
    return this.optionRepo.find({
      where: { addon_group_id: groupId, is_archived: false },
      order: { sort_order: 'ASC', id: 'ASC' },
    });
  }

  async createAddonOption(
    groupId: number,
    dto: CreateItemAddonOptionDto,
    actorId?: number | null,
  ) {
    const g = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!g) {
      throw new NotFoundException(`Add-on group ${groupId} not found`);
    }
    const row = this.optionRepo.create({
      addon_group_id: groupId,
      name: dto.name,
      price: dto.price ?? 0,
      sort_order: dto.sort_order ?? 0,
      is_active: dto.is_active ?? true,
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    });
    return this.optionRepo.save(row);
  }

  async updateAddonOption(
    optionId: number,
    patch: Partial<CreateItemAddonOptionDto>,
    actorId?: number | null,
  ) {
    const row = await this.optionRepo.findOne({ where: { id: optionId } });
    if (!row) {
      throw new NotFoundException(`Add-on option ${optionId} not found`);
    }
    Object.assign(row, patch, { updated_by: actorId ?? null });
    return this.optionRepo.save(row);
  }

  async archiveAddonOption(optionId: number, actorId?: number | null) {
    const row = await this.optionRepo.findOne({ where: { id: optionId } });
    if (!row) {
      throw new NotFoundException(`Add-on option ${optionId} not found`);
    }
    row.is_archived = true;
    row.updated_by = actorId ?? null;
    return this.optionRepo.save(row);
  }

  private async assertCategory(categoryId: number, restaurantId: number) {
    const cat = await this.categoryRepo.findOne({ where: { id: categoryId } });
    if (!cat || cat.restaurant_id !== restaurantId) {
      throw new NotFoundException(
        `Category ${categoryId} not found for restaurant ${restaurantId}`,
      );
    }
  }
}
