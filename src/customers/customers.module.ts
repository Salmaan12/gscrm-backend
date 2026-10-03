import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customer } from 'src/entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    SharedModule
  ],
  controllers: [CustomersController],
  providers: [
    {
      provide: 'CUSTOMER-SERVICE',
      useClass: CustomersService
    }
  ],
  exports: [
    {
      provide: 'CUSTOMER-SERVICE',
      useClass: CustomersService
    },
  ]
})
export class CustomersModule {}
