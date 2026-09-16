import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';
import { AppModuleEntity } from './module.entity';

@Entity('user_modules')
export class UserModule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  moduleId!: number;

  @Column({ type: 'boolean', default: false })
  create!: boolean;

  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @Column({ type: 'boolean', default: false })
  update!: boolean;

  @Column({ type: 'boolean', default: false })
  delete!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(() => User, (user) => user.userModules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => AppModuleEntity, (module) => module.userModules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'moduleId' })
  module!: AppModuleEntity;
}