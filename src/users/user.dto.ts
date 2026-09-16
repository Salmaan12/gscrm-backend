import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Exclude, Expose, plainToClass } from 'class-transformer';

export class CreateUser{
    
    @IsNotEmpty()
    userName!: string;
    
    @IsNotEmpty()
    firstName!: string;

    @IsNotEmpty()
    lastName!: string;

    @IsNotEmpty()
    fullName!: string;

    @IsNotEmpty()
    Phone!: string;

    @IsNotEmpty()
    dateOfBirth!: Date;

    @IsNotEmpty()
    IsActive!: boolean;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsNotEmpty()
    password!: string;
}

export class AuthenticateUser{
    @IsNotEmpty()
    username!: string;

    @IsNotEmpty()
    password!: string;
}

export class ChangePasswordDto{

    @IsNotEmpty()
    userName!: string;

    @IsNotEmpty()
    current_password!: string;

    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    new_password!: string;

    @IsNotEmpty()
    confirm_password!: string;
    
}

export class SerializeUser {

    @Expose()
    userName!: string;

    @Expose()
    email!: string;

    @Expose()
    id!: number;

    @Expose()
    IsActive!: string;

    @Expose()
    firstName!: string;

    @Expose()
    lastName!: string;

    @Expose()
    fullName!: string;

    @Expose()
    dateOfBirth!: Date;

    @Expose()
    auth_token!: string;

    @Exclude()
    password!: string

    constructor(
        partial: Partial<SerializeUser>
    ){
        return plainToClass(SerializeUser, partial, {excludeExtraneousValues: true})
    }
}