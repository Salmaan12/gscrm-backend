import { BadRequestException, Body, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticateUser, ChangePasswordDto, CreateUser, SerializeUser } from './user.dto';
import { ResponseService } from 'src/shared/services/response.service';
import { User } from 'src/entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from 'src/shared/services/jwt.service';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly _userRepo: Repository<User>,
        @Inject("RESPONSE-SERVICE") private res: ResponseService,
        @Inject('JWT-SERVICE') private jwt: JwtService
    ) {}

    async createUser(body: CreateUser, req: Request) {
        try {

            const { userName, firstName, lastName, fullName, Phone, dateOfBirth, IsActive, email, password } = body;

            const checkUserAlreadyExists: User[] = await this._userRepo.createQueryBuilder('user')
                .where('user.userName = :userName', { userName })
                .execute();

            if (checkUserAlreadyExists.length > 0) {
                return this.res.generateError('User already exists', req);
            }

            const salt: string = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            const payload: User | any = {
                userName: userName,
                firstName: firstName,
                lastName: lastName,
                fullName: fullName,
                phone: Phone,
                dateOfBirth: dateOfBirth,
                isActive: IsActive,
                email: email,
                password: hash
            };

            const user = this._userRepo.create(payload);
            await this._userRepo.save(user);

            return this.res.generateResponse(
                200,
                'User created successfully',
                user,
                req
            );
            
        } catch (error) {
            return this.res.generateError(
                error || 'Something went wrong',
                req
            );
        }
    }

    async AuthenticateUser(@Body() body: AuthenticateUser, req: Request) {
        try {

            const { username, password } = body;

            const findUserByuserName: User | null = await this._userRepo.createQueryBuilder('user')
                .where('user.userName = :userName OR user.email = :userName', { userName: username })
                .getOne();

            if (!findUserByuserName) {
                return this.res.generateError('User not found', req);
            }

            const { password: Hashpassword } = findUserByuserName;

            const isValidPassword = await bcrypt.compare(password, Hashpassword);

            if (!isValidPassword) {
                return this.res.generateError('Invalid credentials', req);
            }

            const serializeUser = new SerializeUser(findUserByuserName);
            const { email, firstName, lastName, fullName, dateOfBirth, IsActive } = serializeUser;

            const payload = {
                email: email,
                userName: username,
                firstname: firstName,
                lastname: lastName,
                fullName: fullName,
                dateOfBirth,
                IsActive
            }

            const token = this.jwt.createAuthToken(payload)

            const updateUser = await this._userRepo.createQueryBuilder('user')
                .update()
                .set({
                    auth_token: token
                })
                .where("userName = :userName OR email = :userName", { userName: username })
                .execute()

            if (!updateUser.affected) {
                return this.res.generateError('Failed to update user auth token',req);
            }

            serializeUser.auth_token = token

            return this.res.generateResponse(
                200,
                'User authenticated successfully',
                serializeUser,
                req
            );

        } catch (error) {
            return this.res.generateError(
                error || 'Something went wrong',
                req
            );
        }
    }

    async getAllUsers(req: Request) {
        try {
            const users: User[] = await this._userRepo.find({
                where: {
                    deleted_at: IsNull()
                },
                select: {
                    id: true,
                    userName: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    fullName: true,
                    dateOfBirth: true,
                    isActive: true
                }
            });
            return this.res.generateResponse(
                200,
                'Users retrieved successfully',
                users,
                req
            );
        } catch (error) {
            return this.res.generateError(
                error || 'Something went wrong',
                req
            );
        }
    }

    async changePassword(body: ChangePasswordDto, req: Request) {

        try {
            const { userName, current_password, new_password, confirm_password } = body;

            // Check User is valide or not

            const isValidEmailoruserName = await this._userRepo.createQueryBuilder('Wl_Account')
                .where('userName = :userName OR email = :email', { userName, email: userName })
                .getOne();

            //    if not valide return error message                 

            if (!isValidEmailoruserName) return this.res.generateResponse(HttpStatus.BAD_REQUEST, "Invalid Email or userName", null, req);

            const { password: hashPassword } = isValidEmailoruserName;

            // check password is valid or not
            const isValidPassword = await bcrypt.compare(current_password, hashPassword);

            //    if not valide return error message        

            if (!isValidPassword) return this.res.generateResponse(HttpStatus.BAD_REQUEST, 'please enter a valid password', null, req);

            // if new password and current password is not matched return error message

            if (new_password != confirm_password) return this.res.generateResponse(HttpStatus.BAD_REQUEST, 'New password and Confirm Password does not match', null, req);


            /// Hash new password

            const salt = await bcrypt.genSalt(10);
            const HashedPassword = await bcrypt.hash(new_password, salt);


            // check current password and new password is same return error
            if (current_password == new_password) return this.res.generateResponse(HttpStatus.BAD_REQUEST, "Current Password and New Password can not be same", [], req);


            // Update new password is Database
            const UpdatePassword = await this._userRepo.createQueryBuilder('Wl_Account')
                .update()
                .set({
                    password: HashedPassword
                })
                .where('userName = :userName OR email = :userName', { userName })
                .execute()

            // if password not update return error message
            if (!UpdatePassword.affected) throw new Error("user not able to authenticate, internal server issues");

            /// Return success message
            return this.res.generateResponse(HttpStatus.OK, "Password Changed Successfully", [], req);
        } catch (error) {
            return this.res.generateError(error, req)
        }

    }
}
