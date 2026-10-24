import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { TrainingsService } from './trainings.service';
import { FeatureGuard, RequireFeature } from '../../common/features/feature-flags';

class ReserveTrainingDto {
  @IsString() orderId!: string;
  @IsString() participantName!: string;
  @IsEmail() participantEmail!: string;
  @IsOptional() @IsString() participantPhone?: string;
}

@UseGuards(FeatureGuard)
@RequireFeature('TRAININGS')
@Controller('trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Get('sessions/:publicId')
  getSession(@Param('publicId') publicId: string) {
    return this.trainingsService.getSession(publicId);
  }

  @Post('sessions/:sessionId/reserve')
  reserve(@Param('sessionId') sessionId: string, @Body() body: ReserveTrainingDto) {
    return this.trainingsService.reserveSeats({ sessionId, ...body });
  }
}
