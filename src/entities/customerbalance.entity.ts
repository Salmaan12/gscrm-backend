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

@Entity('customerbalance')
export class CustomerBalance {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    customerId!: number;

    @Column({ type: 'varchar', length: 50 })
    weight!: string;

    @Column({ type: 'varchar', length: 50 })
    amount!: string;

    @CreateDateColumn({
        type: 'datetime',
    })
    created_at!: Date;

    @UpdateDateColumn({
        type: 'datetime',
    })
    updated_at!: Date;

    @ManyToOne(() => Customer, (customer) => customer.customerBalance, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'customerId' })
    customer!: Customer;

}