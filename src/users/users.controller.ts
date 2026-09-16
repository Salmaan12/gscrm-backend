import { Body, Controller, Get, Inject, Post, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticateUser, ChangePasswordDto, CreateUser } from './user.dto';
import { Request as request } from 'express';

@Controller('users')
export class UsersController {

    constructor(
        @Inject("USER-SERVICE") private _users: UsersService,
    ){}

    @Post('create')
    createUser(@Body() body: CreateUser, @Request() req: request) {
        return this._users.createUser(body,req);
    }

    @Post('authenticate')
    authenticateUser(@Body() body: AuthenticateUser, @Request() req: request) {
        return this._users.AuthenticateUser(body,req);
    }

    @Get('all')
    getAllUsers(@Request() req: request) {
        return this._users.getAllUsers(req);
    }

    @Post('change-password')
    ChangePassword(@Body() body: ChangePasswordDto, @Request() req: request){
        return this._users.changePassword(body, req);
    }

}
