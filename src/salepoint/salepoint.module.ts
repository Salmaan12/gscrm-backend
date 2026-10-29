import { Module } from '@nestjs/common';
import { SalePointController } from './salepoint.controller';
import { SalePointService } from './salepoint.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';
import { SalePoint } from 'src/entities/salepoint.entity';
import { Expense } from 'src/entities/expense.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalePoint, Expense]),
    SharedModule
  ],
  controllers: [SalePointController],
  providers: [
    {
      provide: 'SALEPOINT-SERVICE',
      useClass: SalePointService
    }
  ],
  exports: [
    {
      provide: 'SALEPOINT-SERVICE',
      useClass: SalePointService
    },
  ]
})
export class SalePointModule {}
