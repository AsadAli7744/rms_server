import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Branch } from '../branches/entities/branch.entity';
import { ReservationsService } from './reservations.service';
import {
  ReservationsBranchController,
  ReservationsController,
} from './reservations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Branch])],
  controllers: [ReservationsBranchController, ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService, TypeOrmModule],
})
export class ReservationsModule {}
