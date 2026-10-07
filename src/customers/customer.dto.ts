import { IsBoolean, IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Exclude, Expose, plainToClass } from 'class-transformer';

export class CreateUpdateCustomer {

    @IsNotEmpty()
    customerName!: string;

    @IsNotEmpty()
    primaryPhone!: string;

    @IsNotEmpty()
    secondaryPhone!: string;

    @IsNotEmpty()
    cnic!: string;

    @IsNotEmpty()
    refineCharges!: string;

    @IsNotEmpty()
    diffCharges!: string;

    @IsNotEmpty()
    @IsBoolean() 
    isActive!: boolean;
}
