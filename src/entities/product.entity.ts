import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProductBrand } from './product-brand.entity';
import { CurrentRateProductBrandSku } from './current-rate-product-brand-sku.entity';
import { Ratework } from './ratework.entity';
import { SalePoint } from './salepoint.entity';
import { Inventory } from './inventory.entity';
import { Expense } from './expense.entity';
import { InventorySnapshot } from './inventorysnapshot.entity';

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

  @OneToMany(() => SalePoint, (salePoint) => salePoint.product)
  salePoint!: SalePoint[];

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventory!: Inventory[];

  @OneToMany(() => Expense, (expense) => expense.product)
  expense!: Expense[];

  @OneToMany(() => InventorySnapshot, (inventorysnapshot) => inventorysnapshot.product)
  inventorysnapshot!: InventorySnapshot[];
}