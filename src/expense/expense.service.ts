import {
    BadRequestException,
    Body,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateUpdateExpense, PaginationDto } from './expense.dto';
import { ResponseService } from 'src/shared/services/response.service';
import { Expense } from 'src/entities/expense.entity';
import { IsNull, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { Product } from 'src/entities/product.entity';

@Injectable()
export class ExpenseService {
    constructor(
        @InjectRepository(Expense)
        private readonly _expenseRepo: Repository<Expense>,
        @InjectRepository(Product)
        private readonly _productRepo: Repository<Product>,
        @Inject('RESPONSE-SERVICE') private res: ResponseService,
    ) { }

    async createExpense(body: CreateUpdateExpense, req: Request) {
        try {
            const {
                amount,
                expenseType,
                description,
                expenseDate,
            } = body;

            const cashproduct = await this._productRepo.findOneBy({ name: 'CASH' });
    
            if (!cashproduct) {
                return this.res.generateError('Product cash doesn\'t exists coudn\'t able to create a Expense record', req);
            }


            const payload: Expense | any = {
                productId: cashproduct.id,
                amount: amount,
                expenseType: expenseType,
                description: description,
                expenseDate: expenseDate,
            };

            const expense = this._expenseRepo.create(payload);
            await this._expenseRepo.save(expense);

            return this.res.generateResponse(
                200,
                'Expense created successfully',
                expense,
                req,
            );
        } catch (error) {
            return this.res.generateError(error || 'Something went wrong', req);
        }
    }

    async updateExpense(id: number, body: CreateUpdateExpense, req: Request) {
        try {
            const findExpense = await this._expenseRepo.findOneBy({ id: +id });

            if (!findExpense) {
                throw new HttpException('Expense not found', HttpStatus.NOT_FOUND);
            }
            const updateExpense = await this._expenseRepo.update({ id }, body);

            return this.res.generateResponse(
                HttpStatus.OK,
                'Expense Updated Successfully',
                updateExpense,
                req,
            );
        } catch (error) {
            return this.res.generateError(error, req);
        }
    }

    async getExpenseById(expenseId: string) {
        const expense = await this._expenseRepo.findOneBy({ id: +expenseId });
        return expense;
    }

    async deleteExpenseById(id: number, req: Request) {
        try {
            const expenseentry = await this._expenseRepo.findOneBy({ id: +id });

            if (!expenseentry) {
                throw new HttpException('Expense not found', HttpStatus.NOT_FOUND);
            }

            const updateexpenseentry = await this._expenseRepo.createQueryBuilder('expense')
                .update()
                .set({
                    isDeleted: true,
                    deleted_at: new Date()
                })
                .where('id = :id', { id })
                .execute()

            // if expense not update return error message
            if (!updateexpenseentry.affected) throw new Error("Expense Entry not updated, internal server issues");

            /// Return success message
            return this.res.generateResponse(HttpStatus.OK, "Expense Deleted Successfully", [], req);
        } catch (error) {
            return this.res.generateError(error, req);
        }
    }

    async getAllExpensesWithPagination(params: PaginationDto, req: Request) {
        try {
            const { page, pageSize, searchStr } = params;

            const where = searchStr
                ? [
                    { expenseType: Like(`%${searchStr}%`) },
                    { description: Like(`%${searchStr}%`) },
                ]
                : undefined;

            const [expenses, total] = await this._expenseRepo.findAndCount({
                where,
                select: {
                    id: true,
                    amount: true,
                    expenseType: true,
                    description: true,
                    expenseDate: true,
                },
                skip: (parseInt(page) - 1) * parseInt(pageSize),
                take: parseInt(pageSize),
                order: {
                    id: 'DESC',
                },
            });

            const response = {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / parseInt(pageSize)),
                list: expenses,
            };

            return this.res.generateResponse(
                HttpStatus.OK,
                'Expenses retrieved successfully',
                response,
                req,
            );
        } catch (error) {
            return this.res.generateError(error || 'Something went wrong', req);
        }
    }
}
