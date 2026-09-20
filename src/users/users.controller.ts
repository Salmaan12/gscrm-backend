import { Body, Controller, Get, Inject, Post, Request, UseGuards  } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticateUser, ChangePasswordDto, CreateUser } from './user.dto';
import { Request as request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {

    constructor(
        @Inject("USER-SERVICE") private _users: UsersService,
    ){}

    @Post('create')
    @UseGuards(JwtAuthGuard)
    createUser(@Body() body: CreateUser, @Request() req: request) {
        return this._users.createUser(body,req);
    }

    @Post('authenticate')
    authenticateUser(@Body() body: AuthenticateUser, @Request() req: request) {
        return this._users.AuthenticateUser(body,req);
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    getAllUsers(@Request() req: request) {
        return this._users.getAllUsers(req);
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    ChangePassword(@Body() body: ChangePasswordDto, @Request() req: request){
        return this._users.changePassword(body, req);
    }

}
