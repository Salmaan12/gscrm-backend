import { Module } from '@nestjs/common';
import { ResponseService } from './services/response.service';
import { JwtService } from './services/jwt.service';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationLogs } from 'src/entities/application-logs.entity';

@Module({

    imports: [
        TypeOrmModule.forFeature([User,ApplicationLogs]),
    ],
    controllers: [],
    providers: [
        {
            provide: 'RESPONSE-SERVICE',
            useClass: ResponseService
        },
        {
            provide: 'JWT-SERVICE',
            useClass: JwtService
        },
    ],
    exports: [
        {
            provide: 'RESPONSE-SERVICE',
            useClass: ResponseService
        },
        {
            provide: 'JWT-SERVICE',
            useClass: JwtService
        },
    ]

})
export class SharedModule { }
