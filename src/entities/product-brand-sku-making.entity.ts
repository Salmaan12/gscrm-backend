import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProductBrandSku } from './product-brand-sku.entity';

@Entity('product_brand_sku_making')
export class ProductBrandSkuMaking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productBrandSkuId!: number;

  @Column({ type: 'varchar', length: 255 })
  makingCharges!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(
    () => ProductBrandSku,
    (productBrandSku) => productBrandSku.makings,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'productBrandSkuId' })
  productBrandSku!: ProductBrandSku;
}