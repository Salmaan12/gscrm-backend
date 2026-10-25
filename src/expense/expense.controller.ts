import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Put, Request, UseGuards, Delete, Query, ParseArrayPipe, ValidationPipe, UsePipes } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateUpdateExpense, PaginationDto } from './expense.dto';
import { Request as request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('expense')
export class ExpenseController {

    constructor(
        @Inject("EXPENSE-SERVICE") private _expense: ExpenseService,
    ) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    createExpense(@Body() body: CreateUpdateExpense, @Request() req: request) {
        return this._expense.createExpense(body, req);
    }

    @Put('update/:id')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    updateExpense(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: CreateUpdateExpense,
        @Request() req: request) {
        return this._expense.updateExpense(id, body, req);
    }

    @Get('all/pagination')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    getAllExpensesWithPagination(@Query() params: PaginationDto, @Request() req: request) {
        return this._expense.getAllExpensesWithPagination(params, req);
    }

    @Get('getExpenseById/:id')
    @UseGuards(JwtAuthGuard)
    findExpenseById(@Param('id') id: string) {
        return this._expense.getExpenseById(id);
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    deleteExpenseById(@Param('id', ParseIntPipe) id: number, @Request() req: request) {
        return this._expense.deleteExpenseById(id, req);
    }

}
