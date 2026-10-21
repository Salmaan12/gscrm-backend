import { IsBoolean, IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Exclude, Expose, plainToClass } from 'class-transformer';

export class CreateSalePoint {

    @IsNotEmpty()
    referenceNo!: string;

    @IsNotEmpty()
    customerId!: number;

    @IsNotEmpty()
    productId!: number;

    @IsOptional()
    productBrandId!: number;

    @IsOptional()
    productBrandSkuId!: number;

    @IsNotEmpty()
    transactionCategory!: string;

    @IsOptional()
    report!: string;

    @IsOptional()
    weight!: string;

    @IsOptional()
    pureWeight!: string;

    @IsOptional()
    qty!: string;

    @IsOptional()
    amount!: string;

    @IsNotEmpty()
    difference!: string;

    @IsNotEmpty()
    differenceTotal!: string;

    @IsNotEmpty()
    making!: string;

    @IsNotEmpty()
    makingTotal!: string;

    @IsNotEmpty()
    refining!: string;

    @IsNotEmpty()
    refiningTotal!: string;

    @IsOptional()
    karat!: string;

    @IsNotEmpty()
    rate!: string;

    @IsNotEmpty()
    status!: string;

    @IsNotEmpty()
    recordcreated_at!: Date;

}

export class SalePointDto {

    @IsNotEmpty()
    startDate!: string;

    @IsNotEmpty()
    endDate!: string;

    customerId!: number;

    referenceNo!: number;

}