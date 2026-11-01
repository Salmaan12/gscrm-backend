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
import { CreateSalePoint, DailyReportSubmitDto, SalePointDto } from './salepoint.dto';
import { ResponseService } from 'src/shared/services/response.service';
import { SalePoint } from 'src/entities/salepoint.entity';
import { Between, DataSource, In, IsNull, Like, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { Expense } from 'src/entities/expense.entity';
import { InventorySnapshot } from 'src/entities/inventorysnapshot.entity';
import { DailyReportSnapshot } from 'src/entities/dailyreportsnapshot.entity';
import { Product } from 'src/entities/product.entity';

@Injectable()
export class SalePointService {
  constructor(
    @InjectRepository(SalePoint)
    private readonly _salepointRepo: Repository<SalePoint>,
    @InjectRepository(Expense)
    private readonly _expenseRepo: Repository<Expense>,
    @Inject('RESPONSE-SERVICE') private res: ResponseService,
    private readonly _dataSource: DataSource,
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
        totalgm: (entry.productType.toLowerCase() == "lab" || entry.productType.toLowerCase() == "ginni" || entry.productType.toLowerCase() == "pc") ? Number(entry.weight ?? 0) : (Number(entry.qty ?? 0) * Number(entry.weight ?? 0)),
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

  async submitDailyReport(params: DailyReportSubmitDto, req: Request) {
    try {
      const { dailyreportDate } = params;
      if ((dailyreportDate ?? '') == '') {
        return this.res.generateError('Daily Report Date is required to submit Daily Report', req);
      }
      return await this._dataSource.transaction(async (manager) => {
        const inventorysnapshotRepo = manager.getRepository(InventorySnapshot);
        const salepointRepo = manager.getRepository(SalePoint);
        const dailyreportsnapshotRepo = manager.getRepository(DailyReportSnapshot);

        // Prevent submitting the same report date twice.
        const existingReport = await dailyreportsnapshotRepo.findOne({
          where: {
            dailyreportDate: dailyreportDate as any,
          },
          select: {
            id: true,
          },
        });

        if (existingReport) {
          return this.res.generateError('Daily Report has already been submitted for this date', req);
        }

        const start = new Date(dailyreportDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(dailyreportDate);
        end.setHours(23, 59, 59, 999);

        const where: any = {
          recordcreated_at: Between(start, end),
          transactionCategory: Not(In(['Bill Received', 'Bill Given'])),
          productType: Not('RateWork'),
        };
        where.isDeleted = false;

        const salepointentries = await salepointRepo.find({
          where,
          select: {
            id: true,
            referenceNo: true,
            customerId: true,
            productId: true,
            productBrandId: true,
            productBrandSkuId: true,
            transactionCategory: true,
            weight: true,
            qty: true,
            amount: true,
            product: {
              name: true,
              id: true // Required by TypeORM to map relations properly
            },
          },
          relations: {
            product: true,
          },
        });

        if (salepointentries.length == 0) {
          return this.res.generateError('No Entries Found for this date to submit Daily Report.', req);
        }

        const inventorysnapshotentries = await inventorysnapshotRepo.find({
          select: {
            id: true,
            productId: true,
            productBrandId: true,
            productBrandSkuId: true,
            weight: true,
            qty: true,
            amount: true,
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });

        const dailyReportSnapshots = inventorysnapshotentries.map(snapshot =>
          dailyreportsnapshotRepo.create({
            productId: snapshot.productId,
            productBrandId: snapshot.productBrandId,
            productBrandSkuId: snapshot.productBrandSkuId,
            qty: snapshot.qty,
            weight: snapshot.weight,
            amount: snapshot.amount,
            dailyreportDate: start,
          }),
        );

        if (dailyReportSnapshots.length > 0) {
          await dailyreportsnapshotRepo.save(dailyReportSnapshots);
        }

        // Composite key for identifying a snapshot
        const getSnapshotKey = (
          productId: number,
          productBrandId: number | null,
          productBrandSkuId: number | null,
        ) => `${productId}_${productBrandId ?? 'NULL'}_${productBrandSkuId ?? 'NULL'}`;

        // Map existing snapshots for fast lookup
        const snapshotMap = new Map<string, InventorySnapshot>();

        for (const snapshot of inventorysnapshotentries) {
          snapshotMap.set(
            getSnapshotKey(
              snapshot.productId,
              snapshot.productBrandId,
              snapshot.productBrandSkuId,
            ),
            snapshot,
          );
        }

        // Aggregate all SalePoint adjustments
        const adjustmentMap = new Map<string, {
          productId: number;
          productBrandId: number | null;
          productBrandSkuId: number | null;
          qty: number;
          weight: number;
          amount: number;
        }>();

        const cashProductTypes = [
          'TESTING',
          'REFINING',
          'DIFFERENCE',
          'MAKING',
        ];

        for (const entry of salepointentries) {

          const key = getSnapshotKey(
            entry.productId,
            entry.productBrandId,
            entry.productBrandSkuId,
          );

          // Determine transaction direction
          const category =
            String(entry.transactionCategory).toUpperCase();

          const multiplier =
            category === 'GIVEN' ? -1 :
              category === 'RECEIVED' ? 1 : 0;

          if (multiplier === 0) {
            continue;
          }

          // Determine product type
          const productType = String(
            entry.productType ?? '',
          ).trim().toUpperCase();

          const productName = String(
            entry.product?.name ?? '',
          ).trim().toUpperCase();

          // Cash-based entries
          const isCash =
            productName === 'CASH' ||
            cashProductTypes.some(type => productType.includes(type));

          // Get or initialize aggregate
          let adjustment = adjustmentMap.get(key);

          if (!adjustment) {
            adjustment = {
              productId: entry.productId,
              productBrandId: entry.productBrandId ?? null,
              productBrandSkuId: entry.productBrandSkuId ?? null,
              qty: 0,
              weight: 0,
              amount: 0,
            };

            adjustmentMap.set(key, adjustment);
          }

          const qty = Number(entry.qty ?? 0);
          const weight = Number(entry.weight ?? 0);
          const amount = Number(entry.amount ?? 0);

          // Apply transaction-specific adjustment
          if (isCash) {

            adjustment.amount += amount * multiplier;

          } else if (
            productName === 'LAB' ||
            productName === 'GINNI'
          ) {

            adjustment.weight += weight * multiplier;

          } else if (
            productName === 'COIN' ||
            productName === 'BAR'
          ) {

            adjustment.qty += qty * multiplier;
            adjustment.weight += (qty * weight) * multiplier;

          } else if (productName === 'PC') {

            adjustment.qty += qty * multiplier;
            adjustment.weight += weight * multiplier;
          }
        }

        // Apply aggregated adjustments to snapshots
        const updatedSnapshots: InventorySnapshot[] = [];

        for (const [key, adjustment] of adjustmentMap) {

          let snapshot = snapshotMap.get(key);

          // Create snapshot if it doesn't exist
          if (!snapshot) {
            const payload: InventorySnapshot | any = {
              productId: adjustment.productId,
              productBrandId: adjustment.productBrandId,
              productBrandSkuId: adjustment.productBrandSkuId,
              qty: 0,
              weight: 0,
              amount: 0,
            };

            snapshot = inventorysnapshotRepo.create(payload as InventorySnapshot);
          }

          // Update balances
          snapshot.qty = String(
            Number(snapshot.qty ?? 0) + adjustment.qty);

          snapshot.weight = String(
            Number(snapshot.weight ?? 0) + adjustment.weight);

          snapshot.amount = String(
            Number(snapshot.amount ?? 0) + adjustment.amount);

          updatedSnapshots.push(snapshot);
        }

        // Save all modified inventory snapshots in bulk
        if (updatedSnapshots.length > 0) {
          await inventorysnapshotRepo.save(updatedSnapshots);
        }

        return this.res.generateResponse(
          200,
          'Daily Report submitted successfully.',
          {
            dailyreportDate,
            totalSalePointEntries: salepointentries.length,
            updatedInventorySnapshots: updatedSnapshots.length,
            dailyReportSnapshots: dailyReportSnapshots.length,
          },
          req,
        );

      });
    } catch (error) {
      return this.res.generateError(error || 'Something went wrong', req);
    }
  }

  async getInventorySnapshotOpening(params: DailyReportSubmitDto, req: Request) {
    try {
      const { dailyreportDate } = params;
      if ((dailyreportDate ?? '') == '') {
        // return this.res.generateResponse(
        //     400,
        //     'Daily Report Date is required to get Inventory Snapshot Opening',
        //     null,
        //     req,
        //   );
        return this.res.generateError('Daily Report Date is required to get Inventory Snapshot Opening', req);
      }

      return await this._dataSource.transaction(async (manager) => {
        const productRepo = manager.getRepository(Product);
        const dailyreportsnapshotRepo = manager.getRepository(DailyReportSnapshot);

        // Prevent submitting the same report date twice.
        const existingReport = await dailyreportsnapshotRepo.findOne({
          where: {
            dailyreportDate: dailyreportDate as any,
          },
          select: {
            id: true,
          },
        });

        const data = await productRepo
          .createQueryBuilder('product')

          // Aggregate inventory snapshots once, grouped by product
          .leftJoin(
            (qb) =>
              qb
                .select('snapshot.productId', 'productId')
                .addSelect('SUM(snapshot.qty)', 'qty')
                .addSelect('SUM(snapshot.weight)', 'weight')
                .addSelect('SUM(snapshot.amount)', 'amount')
                .from(existingReport ? DailyReportSnapshot : InventorySnapshot, 'snapshot')
                .where(
                  existingReport
                    ? 'snapshot.dailyreportDate = :dailyreportDate'
                    : '1 = 1',
                  existingReport ? { dailyreportDate } : {},
                )
                .groupBy('snapshot.productId'),
            'stock',
            'stock.productId = product.id',
          )
          .select('product.id', 'productId')
          .addSelect('product.name', 'productName')
          .addSelect('COALESCE(stock.qty, 0)', 'qty')
          .addSelect('COALESCE(stock.weight, 0)', 'weight')
          .addSelect('COALESCE(stock.amount, 0)', 'amount')
          .where('product.isActive = :isActive', { isActive: true })
          .orderBy('product.id', 'ASC')
          .getRawMany();

        const inventorySnapshot = data.map((item) => ({
          productId: Number(item.productId),
          productName: item.productName,
          qty: Number(item.qty),
          weight: Number(item.weight),
          amount: Number(item.amount),
        }));
        return this.res.generateResponse(
          HttpStatus.OK,
          'Inventory Snapshot Opening Fetched Successfully',
          inventorySnapshot,
          req,
        );

      });
    }
    catch (error) {
      return this.res.generateError(error || 'Something went wrong', req);
    }
  }

}