import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Customer } from './customer.entity';
import { Product } from './product.entity';
import { ProductBrandSku } from './product-brand-sku.entity';

@Entity('ratework')
export class Ratework {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  customerId!: number;

  @Column()
  productId!: number;

  @Column()
  productBrandId!: number;

  @Column()
  productBrandSkuId!: number;

  @Column({ type: 'varchar', length: 100 })
  weight!: string;

  @Column({ name: 'R_W', type: 'varchar', length: 100 })
  rW!: string;

  @Column({ type: 'varchar', length: 100 })
  rate!: string;

  @Column({ type: 'varchar', length: 100 })
  amount!: string;

  @Column({ type: 'varchar', length: 100 })
  status!: string;

  @Column({ type: 'varchar', length: 100 })
  difference!: string;

  @Column({ type: 'varchar', length: 100 })
  type!: string;

  @ManyToOne(() => Customer, (customer) => customer.rateworks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @ManyToOne(() => Product, (product) => product.rateworks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @ManyToOne(
    () => ProductBrandSku,
    (productBrandSku) => productBrandSku.rateworks,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'productBrandSkuId' })
  productBrandSku!: ProductBrandSku;
}