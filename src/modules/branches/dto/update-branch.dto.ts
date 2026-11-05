import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateBranchDto } from './create-branch.dto';

export class UpdateBranchDto extends PartialType(
  OmitType(CreateBranchDto, ['restaurant_id'] as const),
) {}
