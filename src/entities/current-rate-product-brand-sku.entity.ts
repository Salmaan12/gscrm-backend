import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from './product.entity';
import { ProductBrand } from './product-brand.entity';
import { ProductBrandSku } from './product-brand-sku.entity';

@Entity('currentrate_productbrandsku')
export class CurrentRateProductBrandSku {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productId!: number;

  @Column()
  productBrandId!: number;

  @Column()
  productBrandSkuId!: number;

  @Column({ type: 'varchar', length: 100 })
  buyValue!: string;

  @Column({ type: 'varchar', length: 100 })
  sellValue!: string;

  @ManyToOne(() => Product, (product) => product.currentRates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @ManyToOne(
    () => ProductBrand,
    (productBrand) => productBrand.currentRates,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'productBrandId' })
  productBrand!: ProductBrand;

  @ManyToOne(
    () => ProductBrandSku,
    (productBrandSku) => productBrandSku.currentRates,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'productBrandSkuId' })
  productBrandSku!: ProductBrandSku;
}