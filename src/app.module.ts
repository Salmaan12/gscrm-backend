import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProductModule } from './products/product.module';
import { CustomersModule } from './customers/customers.module';
import { SalePointModule } from './salepoint/salepoint.module';
import { ExpenseModule } from './expense/expense.module';
import { InventoryModule } from './inventory/inventory.module';
import { SharedModule } from './shared/shared.module';
import entities from './entities';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [join(process.cwd(), '.env')],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3306', 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [...entities],
      synchronize: process.env.DATABASE_SYNC == 'on' ? true : false,
      extra: { allowPublicKeyRetrieval: true }
    }),
    UsersModule,
    ProductModule,
    CustomersModule,
    SalePointModule,
    ExpenseModule,
    InventoryModule,
    SharedModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
