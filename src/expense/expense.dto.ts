import {  IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
import { Exclude, Expose, plainToClass } from 'class-transformer';

export class CreateUpdateExpense {

    @IsNotEmpty()
    amount!: string;

    @IsNotEmpty()
    expenseType!: string;

    @IsOptional()
    description!: string;

    @IsDateString()
    @IsNotEmpty()
    expenseDate!: string;

}

export class PaginationDto {

    @IsNotEmpty()
    pageSize!: string;

    @IsNotEmpty()
    page!: string;

    searchStr!: string;

}
