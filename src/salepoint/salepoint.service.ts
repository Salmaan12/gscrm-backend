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
import { CreateSalePoint, SalePointDto } from './salepoint.dto';
import { ResponseService } from 'src/shared/services/response.service';
import { SalePoint } from 'src/entities/salepoint.entity';
import { Between, In, IsNull, Like, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { Expense } from 'src/entities/expense.entity';

@Injectable()
export class SalePointService {
  constructor(
    @InjectRepository(SalePoint)
    private readonly _salepointRepo: Repository<SalePoint>,
    @InjectRepository(Expense)
    private readonly _expenseRepo: Repository<Expense>,
    @Inject('RESPONSE-SERVICE') private res: ResponseService,
  ) { }

  async createSalePointEntiries(body: CreateSalePoint[], req: Request) {
    try {
      if (body.length > 0) {
        const referenceNo = body.at(0)?.referenceNo;
        const checkSalePointEntriesAlreadyExists: SalePoint[] = await this._salepointRepo
          .createQueryBuilder('salepoint')
          .where(
            'salepoint.referenceNo = :referenceNo',
            { referenceNo },
          )
          .execute();

        if (checkSalePointEntriesAlreadyExists.length > 0) {
          return this.res.generateError('SalePoint Entries already exists against Reference Number', req);
        }

        const payload: SalePoint[] = body.map(item => ({
          referenceNo: item.referenceNo,
          customerId: item.customerId,
          productId: item.productId,
          productBrandId: item.productBrandId,
          productBrandSkuId: item.productBrandSkuId,
          transactionCategory: item.transactionCategory,
          report: item.report,
          weight: item.weight,
          pureWeight: item.pureWeight,
          qty: item.qty,
          amount: item.amount,
          difference: item.difference,
          differenceTotal: item.differenceTotal,
          making: item.making,
          makingTotal: item.makingTotal,
          refining: item.refining,
          refiningTotal: item.refiningTotal,
          karat: item.karat,
          rate: item.rate,
          status: item.status,
          recordcreated_at: item.recordcreated_at,
          productType: item.productType,
          descriptionNote: item.descriptionNote
        } as SalePoint)
        );

        const salepointentries = this._salepointRepo.create(payload);
        await this._salepointRepo.save(salepointentries);

        return this.res.generateResponse(
          200,
          'Sale Point Entries created successfully',
          null,
          req,
        );
      }
      else {
        return this.res.generateResponse(
          200,
          'No Sale Point Entries created',
          null,
          req,
        );
      }
    } catch (error) {
      return this.res.generateError(error || 'Something went wrong', req);
    }
  }

  async getAllSalePointEntiries(params: SalePointDto, req: Request) {
    try {
      const { startDate, endDate, customerId, referenceNo } = params;

      if ((startDate ?? '') == '' || (endDate ?? '') == '') {
        return this.res.generateError('Start & End Dates are required to extract Sale Point Entries.', req);
      }

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const where: any = {
        recordcreated_at: Between(start, end),
        transactionCategory: Not(In(['Bill Received', 'Bill Given'])),
        productType: Not('RateWork'),
      };
      where.isDeleted = false;

      if (customerId !== undefined) {
        where.customerId = customerId;
      }

      if (referenceNo !== undefined) {
        where.referenceNo = referenceNo;
      }


      const salepointentries = await this._salepointRepo.find({
        where,
        select: {
          id: true,
          referenceNo: true,
          customerId: true,
          productId: true,
          productBrandId: true,
          productBrandSkuId: true,
          transactionCategory: true,
          report: true,
          weight: true,
          pureWeight: true,
          qty: true,
          amount: true,
          difference: true,
          differenceTotal: true,
          making: true,
          makingTotal: true,
          refining: true,
          refiningTotal: true,
          karat: true,
          rate: true,
          status: true,
          recordcreated_at: true,
          productType: true,
          descriptionNote: true,
          customer: {
            customerName: true,
            id: true // Required by TypeORM to map relations properly
          },
          product: {
            name: true,
            id: true // Required by TypeORM to map relations properly
          },
          productBrand: {
            name: true,
            id: true // Required by TypeORM to map relations properly
          },
          productBrandSku: {
            name: true,
            id: true // Required by TypeORM to map relations properly
          }
        },
        relations: {
          customer: true,
          product: true,
          productBrand: true,
          productBrandSku: true
        },
        order: {
          id: 'ASC',
        },
      });

      const result = salepointentries.map(entry => ({
          ...entry,
          totalgm:(entry.productType.toLowerCase() == "lab" || entry.productType.toLowerCase() == "ginni" || entry.productType.toLowerCase() == "pc") ? Number(entry.weight ?? 0) : (Number(entry.qty ?? 0) * Number(entry.weight ?? 0)),
      }));

      const expenseEntries: Expense[] = [];

      if (customerId == undefined) {
        const whereforExpense: any = {
          expenseDate: Between(start, end),
          isDeleted: false,
        };
        const expenses = await this._expenseRepo.find({
          where: whereforExpense,
          select: {
            id: true,
            productId: true,
            amount: true,
            expenseType: true,
            description: true,
            expenseDate: true,
            product: {
              name: true,
              id: true // Required by TypeORM to map relations properly
            },
          },
          order: {
            id: 'ASC',
          },
          relations: {
            product: true,
          },
        });
        for (const expense of expenses) {
          expenseEntries.push(expense);
        }
      }

      const response = {
        salePointEntries: result,
        expenseEntries: expenseEntries,
      };

      return this.res.generateResponse(
        HttpStatus.OK,
        'Sale Point Entries retrieved successfully',
        response,
        req,
      );
    } catch (error) {
      return this.res.generateError(error || 'Something went wrong', req);
    }
  }

  async findSalePointEntiriesByReferenceNo(referenceNo: string) {
    const where: any = {
      referenceNo: referenceNo,
      isDeleted: false
    };
    const salepointentries = await this._salepointRepo.find({
      where,
      select: {
        id: true,
        referenceNo: true,
        customerId: true,
        productId: true,
        productBrandId: true,
        productBrandSkuId: true,
        transactionCategory: true,
        report: true,
        weight: true,
        pureWeight: true,
        qty: true,
        amount: true,
        difference: true,
        differenceTotal: true,
        making: true,
        makingTotal: true,
        refining: true,
        refiningTotal: true,
        karat: true,
        rate: true,
        status: true,
        recordcreated_at: true,
        productType: true,
        descriptionNote: true,
        customer: {
          customerName: true,
          id: true // Required by TypeORM to map relations properly
        },
        product: {
          name: true,
          id: true // Required by TypeORM to map relations properly
        },
        productBrand: {
          name: true,
          id: true // Required by TypeORM to map relations properly
        },
        productBrandSku: {
          name: true,
          id: true // Required by TypeORM to map relations properly
        }
      },
      relations: {
        customer: true,
        product: true,
        productBrand: true,
        productBrandSku: true
      },
      order: {
        id: 'ASC',
      },
    });
    return salepointentries;
  }

  async deleteSalePointEntryById(id: number, req: Request) {
    try {
      const findsalepointentry = await this._salepointRepo.findOneBy({ id: +id });

      if (!findsalepointentry) {
        throw new HttpException('Sale Point Entry not found', HttpStatus.NOT_FOUND);
      }

      const updatesalepointentry = await this._salepointRepo.createQueryBuilder('salepoint')
        .update()
        .set({
          isDeleted: true,
          deleted_at: new Date()
        })
        .where('id = :id', { id })
        .execute()

      // if product not update return error message
      if (!updatesalepointentry.affected) throw new Error("Sale Point Entry not updated, internal server issues");

      /// Return success message
      return this.res.generateResponse(HttpStatus.OK, "Sale Point Entry Deleted Successfully", [], req);
    } catch (error) {
      return this.res.generateError(error, req);
    }
  }

  async getAllSalePointEntiriesForCustomerledger(params: SalePointDto, req: Request) {
    try {
      const { startDate, endDate, customerId, referenceNo } = params;

      if ((startDate ?? '') == '' || (endDate ?? '') == '') {
        return this.res.generateError('Start & End Dates are required to extract Sale Point Entries.', req);
      }

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const where: any = {
        recordcreated_at: Between(start, end),
        // transactionCategory: Not(In(['Bill Received', 'Bill Given'])),
        // productType: Not('RateWork'),
      };
      where.isDeleted = false;

      if (customerId !== undefined) {
        where.customerId = customerId;
      }

      if (referenceNo !== undefined) {
        where.referenceNo = referenceNo;
      }


      const salepointentries = await this._salepointRepo.find({
        where,
        select: {
          id: true,
          referenceNo: true,
          customerId: true,
          productId: true,
          productBrandId: true,
          productBrandSkuId: true,
          transactionCategory: true,
          report: true,
          weight: true,
          pureWeight: true,
          qty: true,
          amount: true,
          difference: true,
          differenceTotal: true,
          making: true,
          makingTotal: true,
          refining: true,
          refiningTotal: true,
          karat: true,
          rate: true,
          status: true,
          recordcreated_at: true,
          productType: true,
          descriptionNote: true,
          customer: {
            customerName: true,
            id: true // Required by TypeORM to map relations properly
          },
          product: {
            name: true,
            id: true // Required by TypeORM to map relations properly
          },
          productBrand: {
            name: true,
            id: true // Required by TypeORM to map relations properly
          },
          productBrandSku: {
            name: true,
            id: true // Required by TypeORM to map relations properly
          }
        },
        relations: {
          customer: true,
          product: true,
          productBrand: true,
          productBrandSku: true
        },
        order: {
          id: 'ASC',
        },
      });

      return this.res.generateResponse(
        HttpStatus.OK,
        'Sale Point Entries retrieved successfully',
        salepointentries,
        req,
      );
    } catch (error) {
      return this.res.generateError(error || 'Something went wrong', req);
    }
  }

}