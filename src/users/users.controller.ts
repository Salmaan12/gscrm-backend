import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Put, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticateUser, ChangePasswordDto, CreateUser, UpdateUserDto } from './user.dto';
import { Request as request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {

    constructor(
        @Inject("USER-SERVICE") private _users: UsersService,
    ) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    createUser(@Body() body: CreateUser, @Request() req: request) {
        return this._users.createUser(body, req);
    }

    @Put('update/:id')
    @UseGuards(JwtAuthGuard)
    updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateUserDto,
        @Request() req: request) {
        return this._users.updateUser(id, body, req);
    }

    @Post('authenticate')
    authenticateUser(@Body() body: AuthenticateUser, @Request() req: request) {
        return this._users.AuthenticateUser(body, req);
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    getAllUsers(@Request() req: request) {
        return this._users.getAllUsers(req);
    }

    @Get('getUserById/:id')
    @UseGuards(JwtAuthGuard)
    findUserById(@Param('id') id: string) {
        return this._users.getUserById(id);
    }

    @Post('change-password')
    ChangePassword(@Body() body: ChangePasswordDto, @Request() req: request) {
        return this._users.changePassword(body, req);
    }

}
