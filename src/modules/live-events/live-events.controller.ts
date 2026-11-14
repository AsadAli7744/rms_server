import { Controller, Query, Sse, MessageEvent } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Observable, concat, of } from 'rxjs';
import { LiveEventsService } from './live-events.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantAccessService } from '../../common/tenant/tenant-access.service';
import { ForbiddenException } from '@nestjs/common';

@ApiTags('live-events')
@Controller('live-events')
export class LiveEventsController {
  constructor(
    private readonly liveEventsService: LiveEventsService,
    private readonly access: TenantAccessService,
  ) {}

  @Sse('stream')
  @ApiOperation({ summary: 'Real-time SSE push stream for Kitchen and Cashier screens' })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'kitchen, cashier, manager' })
  @ApiQuery({ name: 'token', required: false, type: String })
  async stream(
    @CurrentUser() user: RequestUser,
    @Query('branchId') branchId?: string,
    @Query('role') role?: string,
  ): Promise<Observable<MessageEvent>> {
    const parsedBranchId = branchId ? parseInt(branchId, 10) : NaN;
    if (!Number.isInteger(parsedBranchId) || parsedBranchId <= 0) {
      throw new ForbiddenException('A branch is required for live updates.');
    }
    await this.access.assertBranch(user, parsedBranchId);

    const restaurantFilter = this.access.isAdmin(user) ? undefined : user.restaurant_id;
    const streamRole = this.access.isAdmin(user) ? undefined : user.role;
    const initialHeartbeat: Observable<MessageEvent> = of({
      data: {
        type: 'connected',
        branch_id: parsedBranchId,
        role: streamRole ?? role ?? 'all',
        message: 'Connected to RMS live push stream',
        timestamp: new Date().toISOString(),
      },
      type: 'connected',
    } as MessageEvent);

    return concat(
      initialHeartbeat,
      this.liveEventsService.getEventsStream(parsedBranchId, streamRole, restaurantFilter),
    );
  }
}
