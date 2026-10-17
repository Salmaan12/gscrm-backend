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
import { CreateUpdateCustomer, PaginationDto } from './customer.dto';
import { ResponseService } from 'src/shared/services/response.service';
import { Customer } from 'src/entities/customer.entity';
import { IsNull, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly _customerRepo: Repository<Customer>,
    @Inject('RESPONSE-SERVICE') private res: ResponseService,
  ) {}

  async createCustomer(body: CreateUpdateCustomer, req: Request) {
    try {
      const {
        customerName,
        primaryPhone,
        secondaryPhone,
        cnic,
        refineCharges,
        diffCharges,
        isActive,
      } = body;

      const checkCustomerAlreadyExists: Customer[] = await this._customerRepo
        .createQueryBuilder('customer')
        .where(
          'customer.customerName = :customerName AND customer.cnic = :cnic',
          { customerName, cnic },
        )
        .execute();

      if (checkCustomerAlreadyExists.length > 0) {
        return this.res.generateError('Customer already exists', req);
      }

      const payload: Customer | any = {
        customerName: customerName,
        primaryPhone: primaryPhone,
        secondaryPhone: secondaryPhone,
        cnic: cnic,
        refineCharges: refineCharges,
        diffCharges: diffCharges,
        isActive: isActive,
      };

      const customer = this._customerRepo.create(payload);
      await this._customerRepo.save(customer);

      return this.res.generateResponse(
        200,
        'Customer created successfully',
        customer,
        req,
      );
    } catch (error) {
      return this.res.generateError(error || 'Something went wrong', req);
    }
  }

  async getAllCustomers(req: Request) {
    try {
      const customers: Customer[] = await this._customerRepo.find({
        select: {
          id: true,
          customerName: true,
          primaryPhone: true,
          secondaryPhone: true,
          cnic: true,
          refineCharges: true,
          diffCharges: true,
          isActive: true,
        },
      });
      return this.res.generateResponse(
        200,
        'Customers retrieved successfully',
        customers,
        req,
      );
    } catch (error) {
      return this.res.generateError(error || 'Something went wrong', req);
    }
  }

  async getCustomerById(customerId: string) {
    const customer = await this._customerRepo.findOneBy({ id: +customerId });
    return customer;
  }

  async updateCustomer(id: number, body: CreateUpdateCustomer, req: Request) {
    try {
      const findCustomer = await this._customerRepo.findOneBy({ id: +id });

      if (!findCustomer) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      const updateCustomer = await this._customerRepo.update({ id }, body);

      return this.res.generateResponse(
        HttpStatus.OK,
        'Customer Updated Successfully',
        updateCustomer,
        req,
      );
    } catch (error) {
      return this.res.generateError(error, req);
    }
  }

  async deleteCustomer(id: number, req: Request) {
    try {
      const checkCustomerExists = await this._customerRepo.findOne({
        where: {
          id: id,
        },
      });

      if (!checkCustomerExists) {
        return this.res.generateError('Customer not found', req);
      }

      const result = await this._customerRepo.delete(id);

      if (result.affected === 0) {
        return this.res.generateError('Customer not found', req);
      }

      /// Return success message
      return this.res.generateResponse(
        HttpStatus.OK,
        'Customer Deleted Successfully',
        [],
        req,
      );
    } catch (error) {
      return this.res.generateError(error || 'Something went wrong', req);
    }
  }

  async getAllCustomersWithPagination(params: PaginationDto, req: Request) {
    try {
      const { page, pageSize, searchStr } = params;

      const where = searchStr
        ? [
            { customerName: Like(`%${searchStr}%`) },
            { cnic: Like(`%${searchStr}%`) },
            { primaryPhone: Like(`%${searchStr}%`) },
            { secondaryPhone: Like(`%${searchStr}%`) },
          ]
        : undefined;

      const [customers, total] = await this._customerRepo.findAndCount({
        where,
        select: {
          id: true,
          customerName: true,
          primaryPhone: true,
          secondaryPhone: true,
          cnic: true,
          refineCharges: true,
          diffCharges: true,
          isActive: true,
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
        list: customers,
      };

      return this.res.generateResponse(
        HttpStatus.OK,
        'Customers retrieved successfully',
        response,
        req,
      );
    } catch (error) {
      return this.res.generateError(error || 'Something went wrong', req);
    }
  }
}
