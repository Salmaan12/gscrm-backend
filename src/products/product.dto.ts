import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Exclude, Expose, plainToClass } from 'class-transformer';

export class CreateProduct{
    
    @IsNotEmpty()
    name!: string;
    
    @IsNotEmpty()
    type!: string;

    @IsNotEmpty()
    IsActive!: boolean;

}

export class UpdateProduct{

    @IsNotEmpty()
    name!: string;
    
    @IsNotEmpty()
    type!: string;

    @IsNotEmpty()
    IsActive!: boolean;

}

export class CreateBrand{
    
    @IsNotEmpty()
    productId!: number;
    
    @IsNotEmpty()
    name!: string;

    @IsNotEmpty()
    IsActive!: boolean;

}

export class UpdateBrand{

    @IsNotEmpty()
    productId!: number;
    
    @IsNotEmpty()
    name!: string;

    @IsNotEmpty()
    IsActive!: boolean;

}

export class CreateBrandSKU{
    
    @IsNotEmpty()
    productBrandId!: number;
    
    @IsNotEmpty()
    name!: string;

    @IsNotEmpty()
    weightInGM!: string;

    @IsNotEmpty()
    makingCharges!: string;

    @IsNotEmpty()
    IsActive!: boolean;

}

export class UpdateBrandSKU{

    @IsNotEmpty()
    productBrandId!: number;
    
    @IsNotEmpty()
    name!: string;

    @IsNotEmpty()
    weightInGM!: string;

    @IsNotEmpty()
    makingCharges!: string;

    @IsNotEmpty()
    IsActive!: boolean;

}