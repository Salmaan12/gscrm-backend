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
import { CreateUpdateInventory, PaginationDto } from './inventory.dto';
import { ResponseService } from 'src/shared/services/response.service';
import { Inventory } from 'src/entities/inventory.entity';
import { IsNull, Like, Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

import { Product } from 'src/entities/product.entity';
import { ProductBrand } from 'src/entities/product-brand.entity';
import { ProductBrandSku } from 'src/entities/product-brand-sku.entity';
import { InventorySnapshot } from 'src/entities/inventorysnapshot.entity';
import { adjustInventorySnapshot } from '../utility/inventory-snapshot.utility';

@Injectable()
export class InventoryService {
    constructor(
        @InjectRepository(Inventory)
        private readonly _inventoryRepo: Repository<Inventory>,
        @InjectRepository(Product)
        private readonly _productRepo: Repository<Product>,
        @InjectRepository(ProductBrand)
        private readonly _productBrandRepo: Repository<ProductBrand>,
        @InjectRepository(ProductBrandSku)
        private readonly _productBrandSkuRepo: Repository<ProductBrandSku>,
        @Inject('RESPONSE-SERVICE') private res: ResponseService,
        private readonly _dataSource: DataSource,
    ) { }

    async createInventory(body: CreateUpdateInventory, req: Request) {
        try {
            return await this._dataSource.transaction(async (manager) => {
                // Use transaction-bound repositories
                const inventoryRepo = manager.getRepository(Inventory);
                const {
                    productId,
                    productBrandId,
                    productBrandSkuId,
                    skuWeight,
                    weight,
                    qty,
                    amount,
                    description,
                    inventoryDate,
                } = body;


                const payload: Inventory | any = {
                    productId: productId,
                    productBrandId: productBrandId,
                    productBrandSkuId: productBrandSkuId,
                    skuWeight: skuWeight,
                    weight: weight,
                    qty: qty,
                    amount: amount,
                    description: description,
                    inventoryDate: inventoryDate,
                    inventoryDirection: 'IN',
                };

                const inventory = inventoryRepo.create(payload);
                await inventoryRepo.save(inventory);

                ///Adjust Inventory Snapshot
                await adjustInventorySnapshot(manager, {
                    productId: productId,
                    productBrandId: productBrandId,
                    productBrandSkuId: productBrandSkuId,
                    weight: (weight == null || weight == undefined) ? undefined : Number(weight),
                    qty: (qty == null || qty == undefined) ? undefined : Number(qty),
                    amount: (amount == null || amount == undefined) ? undefined : Number(amount),
                });

                return this.res.generateResponse(
                    200,
                    'Inventory created successfully',
                    inventory,
                    req,
                );
            });
        } catch (error) {
            return this.res.generateError(error || 'Something went wrong', req);
        }
    }

    async updateInventory(id: number, body: CreateUpdateInventory, req: Request) {
        try {
            return await this._dataSource.transaction(async (manager) => {
                // Use transaction-bound repositories
                const inventoryRepo = manager.getRepository(Inventory);
                const findInventory = await inventoryRepo.findOneBy({ id: +id });

                if (!findInventory) {
                    throw new HttpException('Inventory not found', HttpStatus.NOT_FOUND);
                }
                const updateInventory = await inventoryRepo.update({ id }, body);

                ///Adjust Inventory Snapshot
                await adjustInventorySnapshot(manager, {
                    productId: findInventory.productId,
                    productBrandId: findInventory.productBrandId,
                    productBrandSkuId: findInventory.productBrandSkuId,
                    weight: (findInventory.weight == null || findInventory.weight == undefined) ? undefined : (Number(body.weight) - Number(findInventory.weight)),
                    qty: (findInventory.qty == null || findInventory.qty == undefined) ? undefined : (Number(body.qty) - Number(findInventory.qty)),
                    amount: (findInventory.amount == null || findInventory.amount == undefined) ? undefined : (Number(body.amount) - Number(findInventory.amount)),
                });

                return this.res.generateResponse(
                    HttpStatus.OK,
                    'Inventory Updated Successfully',
                    updateInventory,
                    req,
                );
            });
        } catch (error) {
            return this.res.generateError(error, req);
        }
    }

    async getInventoryById(inventoryId: string, req: Request) {
        try {
            const inventory = await this._inventoryRepo.findOneBy({ id: +inventoryId });
            return this.res.generateResponse(
                HttpStatus.OK,
                'Inventory Fetched Successfully',
                inventory,
                req,
            );
        } catch (error) {
            return this.res.generateError(error, req);
        }
    }

    async deleteInventoryById(id: number, req: Request) {
        try {
            return await this._dataSource.transaction(async (manager) => {
                // Use transaction-bound repositories
                const inventoryRepo = manager.getRepository(Inventory);
                const inventoryentry = await inventoryRepo.findOneBy({ id: +id });

                if (!inventoryentry) {
                    throw new HttpException('Inventory not found', HttpStatus.NOT_FOUND);
                }

                const updateinventoryentry = await inventoryRepo.createQueryBuilder('inventory')
                    .update()
                    .set({
                        isDeleted: true,
                        deleted_at: new Date()
                    })
                    .where('id = :id', { id })
                    .execute()

                // if inventory not update return error message
                if (!updateinventoryentry.affected) throw new Error("Inventory Entry not updated, internal server issues");

                ///Adjust Inventory Snapshot
                await adjustInventorySnapshot(manager, {
                    productId: inventoryentry.productId,
                    productBrandId: inventoryentry.productBrandId,
                    productBrandSkuId: inventoryentry.productBrandSkuId,
                    weight: (inventoryentry.weight == null || inventoryentry.weight == undefined) ? undefined : -Number(inventoryentry.weight),
                    qty: (inventoryentry.qty == null || inventoryentry.qty == undefined) ? undefined : -Number(inventoryentry.qty),
                    amount: (inventoryentry.amount == null || inventoryentry.amount == undefined) ? undefined : -Number(inventoryentry.amount),
                });

                /// Return success message
                return this.res.generateResponse(HttpStatus.OK, "Inventory Deleted Successfully", [], req);
            });
        } catch (error) {
            return this.res.generateError(error, req);
        }
    }

    async getAllInventoriesWithPagination(params: PaginationDto, req: Request) {
        try {
            const { page, pageSize } = params;

            const [inventories, total] = await this._inventoryRepo.findAndCount({
                where: {
                    isDeleted: false,
                },
                select: {
                    id: true,
                    productId: true,
                    productBrandId: true,
                    productBrandSkuId: true,
                    skuWeight: true,
                    weight: true,
                    qty: true,
                    amount: true,
                    description: true,
                    inventoryDate: true,
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
                skip: (parseInt(page) - 1) * parseInt(pageSize),
                take: parseInt(pageSize),
                relations: {
                    product: true,
                    productBrand: true,
                    productBrandSku: true
                },
                order: {
                    id: 'DESC',
                },
            });

            const response = {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / parseInt(pageSize)),
                list: inventories,
            };

            return this.res.generateResponse(
                HttpStatus.OK,
                'Inventories retrieved successfully',
                response,
                req,
            );
        } catch (error) {
            return this.res.generateError(error || 'Something went wrong', req);
        }
    }

    async getInventorySnapshotByProduct(req: Request) {
        try {
            const data = await this._productRepo
                .createQueryBuilder('product')

                // Aggregate inventory snapshots once, grouped by product
                .leftJoin(
                    (qb) =>
                        qb
                            .select('snapshot.productId', 'productId')
                            .addSelect('SUM(snapshot.qty)', 'qty')
                            .addSelect('SUM(snapshot.weight)', 'weight')
                            .addSelect('SUM(snapshot.amount)', 'amount')
                            .from(InventorySnapshot, 'snapshot')
                            .groupBy('snapshot.productId'),
                    'stock',
                    'stock.productId = product.id',
                )
                .leftJoin(
                    (qb) =>
                        qb
                            .select('brand.productId', 'productId')
                            .from(ProductBrand, 'brand')
                            .groupBy('brand.productId'),
                    'brandProducts',
                    'brandProducts.productId = product.id',
                )
                .select('product.id', 'productId')
                .addSelect('product.name', 'productName')
                .addSelect('COALESCE(stock.qty, 0)', 'qty')
                .addSelect('COALESCE(stock.weight, 0)', 'weight')
                .addSelect('COALESCE(stock.amount, 0)', 'amount')
                .addSelect(
                    `CASE
                    WHEN brandProducts.productId IS NOT NULL THEN 1
                    ELSE 0
                    END`,
                    'hasBrands',
                )
                .where('product.isActive = :isActive', { isActive: true })
                .orderBy('product.id', 'ASC')
                .getRawMany();

            const inventorySnapshot = data.map((item) => ({
                productId: Number(item.productId),
                productName: item.productName,
                qty: Number(item.qty),
                weight: Number(item.weight),
                amount: Number(item.amount),
                hasBrands: Number(item.hasBrands) === 1,
            }));
            return this.res.generateResponse(
                HttpStatus.OK,
                'Inventory Snapshot Fetched Successfully',
                inventorySnapshot,
                req,
            );
        } catch (error) {
            return this.res.generateError(error, req);
        }
    }

    async getInventorySnapshotByBrand(productid: number, req: Request) {
        try {
            const data = await this._productBrandRepo
                .createQueryBuilder('productbrand')
                // Aggregate inventory snapshots once, grouped by product
                .leftJoin(
                    (qb) =>
                        qb
                            .select('snapshot.productBrandId', 'productBrandId')
                            .addSelect('SUM(snapshot.qty)', 'qty')
                            .addSelect('SUM(snapshot.weight)', 'weight')
                            .addSelect('SUM(snapshot.amount)', 'amount')
                            .from(InventorySnapshot, 'snapshot')
                            .groupBy('snapshot.productBrandId'),
                    'stock',
                    'stock.productBrandId = productbrand.id',
                )
                .select('productbrand.id', 'productbrandId')
                .addSelect('productbrand.name', 'productbrandName')
                .addSelect('COALESCE(stock.qty, 0)', 'qty')
                .addSelect('COALESCE(stock.weight, 0)', 'weight')
                .addSelect('COALESCE(stock.amount, 0)', 'amount')
                .where('productbrand.isActive = :isActive', { isActive: true })
                .andWhere('productbrand.productId = :productid', { productid })
                .orderBy('productbrand.id', 'ASC')
                .getRawMany();

            const inventorySnapshot = data.map((item) => ({
                productBrandId: Number(item.productbrandId),
                productBrandName: item.productbrandName,
                qty: Number(item.qty),
                weight: Number(item.weight),
                amount: Number(item.amount),
            }));
            return this.res.generateResponse(
                HttpStatus.OK,
                'Inventory Snapshot Fetched Successfully',
                inventorySnapshot,
                req,
            );
        } catch (error) {
            return this.res.generateError(error, req);
        }
    }

    async getInventorySnapshotBySKU(brandid: number, req: Request) {
        try {
            const data = await this._productBrandSkuRepo
                .createQueryBuilder('productbrandsku')
                // Aggregate inventory snapshots once, grouped by product
                .leftJoin(
                    (qb) =>
                        qb
                            .select('snapshot.productBrandSkuId', 'productBrandSkuId')
                            .addSelect('SUM(snapshot.qty)', 'qty')
                            .addSelect('SUM(snapshot.weight)', 'weight')
                            .addSelect('SUM(snapshot.amount)', 'amount')
                            .from(InventorySnapshot, 'snapshot')
                            .groupBy('snapshot.productBrandSkuId'),
                    'stock',
                    'stock.productBrandSkuId = productbrandsku.id',
                )
                .select('productbrandsku.id', 'productBrandSkuId')
                .addSelect('productbrandsku.name', 'productBrandSkuName')
                .addSelect('COALESCE(stock.qty, 0)', 'qty')
                .addSelect('COALESCE(stock.weight, 0)', 'weight')
                .addSelect('COALESCE(stock.amount, 0)', 'amount')
                .where('productbrandsku.isActive = :isActive', { isActive: true })
                .andWhere('productbrandsku.productBrandId = :brandid', { brandid })
                .orderBy('productbrandsku.id', 'ASC')
                .getRawMany();

            const inventorySnapshot = data.map((item) => ({
                productBrandSkuId: Number(item.productBrandSkuId),
                productBrandSkuName: item.productBrandSkuName,
                qty: Number(item.qty),
                weight: Number(item.weight),
                amount: Number(item.amount),
            }));
            return this.res.generateResponse(
                HttpStatus.OK,
                'Inventory Snapshot Fetched Successfully',
                inventorySnapshot,
                req,
            );
        } catch (error) {
            return this.res.generateError(error, req);
        }
    }
}
