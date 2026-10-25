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

@Entity('expense')
export class Expense {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    productId!: number;

    @Column({ type: 'varchar', length: 50 })
    amount!: string;
    
    @Column({ type: 'varchar', length: 50 })
    expenseType!: string;

    @Column({ type: 'varchar', length: 255 })
    description!: string;

    @Column({
        type: 'date',
    })
    expenseDate!: Date;

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

    @ManyToOne(() => Product, (product) => product.expense, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'productId' })
    product!: Product;

}