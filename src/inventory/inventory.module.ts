import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Inventory } from 'src/entities/inventory.entity';
import { Product } from 'src/entities/product.entity';
import { ProductBrand } from 'src/entities/product-brand.entity';
import { ProductBrandSku } from 'src/entities/product-brand-sku.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Inventory,Product,ProductBrand,ProductBrandSku]),
    // TypeOrmModule.forFeature([Inventory]),
    TypeOrmModule.forFeature([Inventory,Product,ProductBrand,ProductBrandSku]),
    SharedModule
  ],
  controllers: [InventoryController],
  providers: [
    {
      provide: 'INVENTORY-SERVICE',
      useClass: InventoryService
    }
  ],
  exports: [
    {
      provide: 'INVENTORY-SERVICE',
      useClass: InventoryService
    },
  ]
})
export class InventoryModule {}
