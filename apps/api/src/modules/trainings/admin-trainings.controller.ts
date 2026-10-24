import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsDateString, IsInt, IsString, Min } from 'class-validator';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { FeatureGuard, RequireFeature } from '../../common/features/feature-flags';
import { TrainingsService } from './trainings.service';

class TrainingDto {
  @IsString() name!: string;
  @IsString() slug!: string;
  @IsString() description!: string;
}

class SessionDto {
  @IsString() trainingId!: string;
  @IsDateString() startsAt!: string;
  @IsDateString() endsAt!: string;
  @IsString() location!: string;
  @IsInt() @Min(1) capacity!: number;
}

@UseGuards(FeatureGuard, SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.PRODUCTS_WRITE)
@RequireFeature('TRAININGS')
@Controller('admin/trainings')
export class AdminTrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Post()
  createTraining(@Body() body: TrainingDto) {
    return this.trainingsService.createTraining(body);
  }

  @Post('sessions')
  createSession(@Body() body: SessionDto) {
    return this.trainingsService.createSession({ ...body, startsAt: new Date(body.startsAt), endsAt: new Date(body.endsAt) });
  }
}
