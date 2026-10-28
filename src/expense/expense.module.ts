import { Module } from '@nestjs/common';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { Expense } from 'src/entities/expense.entity';
import { Product } from 'src/entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';
import { InventorySnapshot } from 'src/entities/inventorysnapshot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense,Product,InventorySnapshot]),
    SharedModule
  ],
  controllers: [ExpenseController],
  providers: [
    {
      provide: 'EXPENSE-SERVICE',
      useClass: ExpenseService
    }
  ],
  exports: [
    {
      provide: 'EXPENSE-SERVICE',
      useClass: ExpenseService
    },
  ]
})
export class ExpenseModule {}
