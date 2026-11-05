import { Global, Module } from '@nestjs/common';
import { LiveEventsService } from './live-events.service';
import { LiveEventsController } from './live-events.controller';

@Global()
@Module({
  controllers: [LiveEventsController],
  providers: [LiveEventsService],
  exports: [LiveEventsService],
})
export class LiveEventsModule {}
