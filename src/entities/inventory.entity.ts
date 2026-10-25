import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';

import { Product } from './product.entity';
import { ProductBrand } from './product-brand.entity';
import { ProductBrandSku } from './product-brand-sku.entity';

@Entity('inventory')
export class Inventory {

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
    
    @Column({ type: 'varchar', length: 50 })
    inventoryDirection!: string;

    @Column({ type: 'varchar', length: 255 })
    description!: string;

    @Column({
        type: 'datetime',
    })
    recordcreated_at!: Date;

    @Column({ type: 'boolean', default: false })
    isDeleted!: boolean;

    @CreateDateColumn({
        type: 'datetime',
    })
    created_at!: Date;

    @UpdateDateColumn({
        type: 'datetime',
    })
    updated_at!: Date;

    @Column({
        type: 'datetime',
        default: null
    })
    deleted_at!: Date;

    @ManyToOne(() => Product, (product) => product.inventory, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'productId' })
    product!: Product;

    @ManyToOne(() => ProductBrand, (productBrand) => productBrand.inventory, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'productBrandId' })
    productBrand!: ProductBrand;

    @ManyToOne(() => ProductBrandSku, (productBrandSku) => productBrandSku.inventory, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'productBrandSkuId' })
    productBrandSku!: ProductBrandSku;

}