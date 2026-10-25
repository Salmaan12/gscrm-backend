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

@Entity('inventorysnapshot')
export class InventorySnapshot {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    productId!: number;

    @Column({ nullable: true })
    productBrandId!: number;

    @Column({ nullable: true })
    productBrandSkuId!: number;

    @Column({ type: 'varchar', length: 15 })
    skuWeight!: string;

    @Column({ type: 'varchar', length: 15 })
    weight!: string;

    @Column({ type: 'varchar', length: 10 })
    qty!: string;

    @Column({ type: 'varchar', length: 50 })
    amount!: string;

    @ManyToOne(() => Product, (product) => product.inventorysnapshot, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'productId' })
    product!: Product;

    @ManyToOne(() => ProductBrand, (productBrand) => productBrand.inventorysnapshot, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'productBrandId' })
    productBrand!: ProductBrand;

    @ManyToOne(() => ProductBrandSku, (productBrandSku) => productBrandSku.inventorysnapshot, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'productBrandSkuId' })
    productBrandSku!: ProductBrandSku;

}