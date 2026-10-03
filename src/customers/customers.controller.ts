import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Put, Request, UseGuards, Delete } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateUpdateCustomer } from './customer.dto';
import { Request as request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('customers')
export class CustomersController {

    constructor(
        @Inject("CUSTOMER-SERVICE") private _customers: CustomersService,
    ) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    createCustomer(@Body() body: CreateUpdateCustomer, @Request() req: request) {
        return this._customers.createCustomer(body, req);
    }

    @Put('update/:id')
    @UseGuards(JwtAuthGuard)
    updateCustomer(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: CreateUpdateCustomer,
        @Request() req: request) {
        return this._customers.updateCustomer(id, body, req);
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    getAllCustomers(@Request() req: request) {
        return this._customers.getAllCustomers(req);
    }

    @Get('getCustomerById/:id')
    @UseGuards(JwtAuthGuard)
    findCustomerById(@Param('id') id: string) {
        return this._customers.getCustomerById(id);
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    deleteProduct(@Param('id', ParseIntPipe) id: number, @Request() req: request) {
        return this._customers.deleteCustomer(id,req);
    }

}
