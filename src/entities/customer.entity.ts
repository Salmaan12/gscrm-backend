import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ratework } from './ratework.entity';

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  customerName!: string;

  @Column({ type: 'varchar', length: 50 })
  primaryPhone!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  secondaryPhone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cnic?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refineCharges?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => Ratework, (ratework) => ratework.customer)
  rateworks!: Ratework[];
}