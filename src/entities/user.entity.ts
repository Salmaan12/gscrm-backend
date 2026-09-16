import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserModule } from './user-module.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  firstName!: string;

  @Column({ type: 'varchar', length: 255 })
  lastName!: string;

  @Column({ type: 'varchar', length: 255 })
  fullName!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  userName!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({
        unique: false,
        nullable: true,
        type: 'longtext',
        default: null
    })
    auth_token!: string;

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

  @OneToMany(() => UserModule, (userModule) => userModule.user)
  userModules!: UserModule[];
}