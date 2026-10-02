import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from 'src/entities/product.entity';
import { ProductBrand } from 'src/entities/product-brand.entity';
import { ProductBrandSku } from 'src/entities/product-brand-sku.entity';
import { ProductBrandSkuMaking } from 'src/entities/product-brand-sku-making.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product,ProductBrand,ProductBrandSku,ProductBrandSkuMaking]),
    SharedModule
  ],
  controllers: [ProductController],
  providers: [
    {
      provide: 'PRODUCT-SERVICE',
      useClass: ProductService
    }
  ],
  exports: [
    {
      provide: 'PRODUCT-SERVICE',
      useClass: ProductService
    },
  ]
})
export class ProductModule {}
