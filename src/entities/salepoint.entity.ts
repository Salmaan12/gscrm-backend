import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';

import { Customer } from './customer.entity';
import { Product } from './product.entity';
import { ProductBrand } from './product-brand.entity';
import { ProductBrandSku } from './product-brand-sku.entity';

@Entity('salepoint')
export class SalePoint {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 50 })
    referenceNo!: string;

    @Column()
    customerId!: number;

    @Column()
    productId!: number;

    @Column({ nullable: true })
    productBrandId!: number;

    @Column({ nullable: true })
    productBrandSkuId!: number;

    @Column({ type: 'varchar', length: 100 })
    transactionCategory!: string;

    @Column({ type: 'varchar', length: 2 })
    report!: string;

    @Column({ type: 'varchar', length: 15 })
    weight!: string;

    @Column({ type: 'varchar', length: 15 })
    pureWeight!: string;

    @Column({ type: 'varchar', length: 5 })
    qty!: string;

    @Column({ type: 'varchar', length: 50 })
    amount!: string;

    @Column({ type: 'varchar', length: 5 })
    difference!: string;
    
    @Column({ type: 'varchar', length: 15 })
    differenceTotal!: string;
    
    @Column({ type: 'varchar', length: 5 })
    making!: string;
    
    @Column({ type: 'varchar', length: 15 })
    makingTotal!: string;
    
    @Column({ type: 'varchar', length: 5 })
    refining!: string;
    
    @Column({ type: 'varchar', length: 15 })
    refiningTotal!: string;
    
    @Column({ type: 'varchar', length: 2 })
    karat!: string;
    
    @Column({ type: 'varchar', length: 20 })
    rate!: string;

    @Column({ type: 'varchar', length: 20 })
    status!: string;

    @Column({ type: 'boolean', default: false })
    isDeleted!: boolean;

    @Column({ type: 'varchar', length: 50 })
    productType!: string;

    @Column({ type: 'varchar', length: 255 })
    descriptionNote!: string;

    @Column({
        type: 'datetime',
    })
    recordcreated_at!: Date;

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

    @ManyToOne(() => Customer, (customer) => customer.salePoint, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'customerId' })
    customer!: Customer;

    @ManyToOne(() => Product, (product) => product.salePoint, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'productId' })
    product!: Product;

    @ManyToOne(() => ProductBrand, (productBrand) => productBrand.salePoint, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'productBrandId' })
    productBrand!: ProductBrand;

    @ManyToOne(() => ProductBrandSku, (productBrandSku) => productBrandSku.salePoint, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'productBrandSkuId' })
    productBrandSku!: ProductBrandSku;

}