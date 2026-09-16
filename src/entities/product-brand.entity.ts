import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from './product.entity';
import { ProductBrandSku } from './product-brand-sku.entity';
import { CurrentRateProductBrandSku } from './current-rate-product-brand-sku.entity';

@Entity('product_brand')
export class ProductBrand {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productId!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(() => Product, (product) => product.productBrands, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @OneToMany(
    () => ProductBrandSku,
    (productBrandSku) => productBrandSku.productBrand,
  )
  productBrandSkus!: ProductBrandSku[];

  @OneToMany(
    () => CurrentRateProductBrandSku,
    (currentRate) => currentRate.productBrand,
  )
  currentRates!: CurrentRateProductBrandSku[];
}