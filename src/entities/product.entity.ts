import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProductBrand } from './product-brand.entity';
import { CurrentRateProductBrandSku } from './current-rate-product-brand-sku.entity';
import { Ratework } from './ratework.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  type!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => ProductBrand, (productBrand) => productBrand.product)
  productBrands!: ProductBrand[];

  @OneToMany(
    () => CurrentRateProductBrandSku,
    (currentRate) => currentRate.product,
  )
  currentRates!: CurrentRateProductBrandSku[];

  @OneToMany(() => Ratework, (ratework) => ratework.product)
  rateworks!: Ratework[];
}