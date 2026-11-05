import { Controller, Get, Query, Sse, MessageEvent } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Observable, concat, of } from 'rxjs';
import { LiveEventsService } from './live-events.service';

@ApiTags('live-events')
@Controller('live-events')
export class LiveEventsController {
  constructor(private readonly liveEventsService: LiveEventsService) {}

  @Sse('stream')
  @ApiOperation({ summary: 'Real-time SSE push stream for Kitchen and Cashier screens' })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'kitchen, cashier, manager' })
  stream(
    @Query('branchId') branchId?: string,
    @Query('role') role?: string,
  ): Observable<MessageEvent> {
    const parsedBranchId = branchId ? parseInt(branchId, 10) : undefined;
    
    // Send an initial handshake event immediately upon connection
    const initialHeartbeat: Observable<MessageEvent> = of({
      data: {
        type: 'connected',
        branch_id: parsedBranchId,
        role: role ?? 'all',
        message: 'Connected to RMS live push stream',
        timestamp: new Date().toISOString(),
      },
      type: 'connected',
    } as MessageEvent);

    return concat(
      initialHeartbeat,
      this.liveEventsService.getEventsStream(parsedBranchId, role),
    );
  }
}
