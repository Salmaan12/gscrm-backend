import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('currentrate')
export class CurrentRate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  type!: string;

  @Column({ type: 'varchar', length: 100 })
  currentValue!: string;

  @Column({ type: 'varchar', length: 100 })
  difference!: string;
}