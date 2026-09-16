import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProductBrand } from './product-brand.entity';
import { ProductBrandSkuMaking } from './product-brand-sku-making.entity';
import { CurrentRateProductBrandSku } from './current-rate-product-brand-sku.entity';
import { Ratework } from './ratework.entity';

@Entity('product_brand_sku')
export class ProductBrandSku {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productBrandId!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  weightInGM?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(
    () => ProductBrand,
    (productBrand) => productBrand.productBrandSkus,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'productBrandId' })
  productBrand!: ProductBrand;

  @OneToMany(
    () => ProductBrandSkuMaking,
    (making) => making.productBrandSku,
  )
  makings!: ProductBrandSkuMaking[];

  @OneToMany(
    () => CurrentRateProductBrandSku,
    (currentRate) => currentRate.productBrandSku,
  )
  currentRates!: CurrentRateProductBrandSku[];

  @OneToMany(() => Ratework, (ratework) => ratework.productBrandSku)
  rateworks!: Ratework[];
}