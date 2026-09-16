import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    SharedModule
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: 'USER-SERVICE',
      useClass: UsersService
    }
  ],
  exports: [
    {
      provide: 'USER-SERVICE',
      useClass: UsersService
    },
  ]
})
export class UsersModule {}
