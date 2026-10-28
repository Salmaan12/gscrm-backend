import {  IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
import { Exclude, Expose, plainToClass } from 'class-transformer';

export class CreateUpdateInventory {

    @IsNotEmpty()
    productId!: number;

    @IsOptional()
    productBrandId!: number;

    @IsOptional()
    productBrandSkuId!: number;

    @IsOptional()
    skuWeight!: string;

    @IsOptional()
    weight!: string;

    @IsOptional()
    qty!: string;

    @IsOptional()
    amount!: string;

    @IsOptional()
    description!: string;

    @IsNotEmpty()
    inventoryDate!: string;

}

export class PaginationDto {

    @IsNotEmpty()
    pageSize!: string;

    @IsNotEmpty()
    page!: string;

}
