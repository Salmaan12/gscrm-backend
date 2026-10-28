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
import { CreateUpdateInventory } from './inventory.dto';
import { ResponseService } from 'src/shared/services/response.service';
import { Inventory } from 'src/entities/inventory.entity';
import { IsNull, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

import { Product } from 'src/entities/product.entity';
import { ProductBrand } from 'src/entities/product-brand.entity';
import { InventorySnapshot } from 'src/entities/inventorysnapshot.entity';

@Injectable()
export class InventoryService {
    constructor(
        @InjectRepository(Inventory)
        private readonly _inventoryRepo: Repository<Inventory>,
        @InjectRepository(Product)
        private readonly _productRepo: Repository<Product>,
        @InjectRepository(ProductBrand)
        private readonly _productBrandRepo: Repository<ProductBrand>,
        @InjectRepository(InventorySnapshot)
        private readonly _inventorySnapshotRepo: Repository<InventorySnapshot>,
        @Inject('RESPONSE-SERVICE') private res: ResponseService,
    ) { }

    async createInventory(body: CreateUpdateInventory, req: Request) {
        try {
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
            };

            const inventory = this._inventoryRepo.create(payload);
            await this._inventoryRepo.save(inventory);

            ///Adjust Inventory Snapshot

            return this.res.generateResponse(
                200,
                'Inventory created successfully',
                inventory,
                req,
            );
        } catch (error) {
            return this.res.generateError(error || 'Something went wrong', req);
        }
    }

    async updateInventory(id: number, body: CreateUpdateInventory, req: Request) {
        try {
            const findInventory = await this._inventoryRepo.findOneBy({ id: +id });

            if (!findInventory) {
                throw new HttpException('Inventory not found', HttpStatus.NOT_FOUND);
            }
            const updateInventory = await this._inventoryRepo.update({ id }, body);

            ///Adjust Inventory Snapshot

            return this.res.generateResponse(
                HttpStatus.OK,
                'Inventory Updated Successfully',
                updateInventory,
                req,
            );
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
            const inventoryentry = await this._inventoryRepo.findOneBy({ id: +id });

            if (!inventoryentry) {
                throw new HttpException('Inventory not found', HttpStatus.NOT_FOUND);
            }

            const updateinventoryentry = await this._inventoryRepo.createQueryBuilder('inventory')
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

            /// Return success message
            return this.res.generateResponse(HttpStatus.OK, "Inventory Deleted Successfully", [], req);
        } catch (error) {
            return this.res.generateError(error, req);
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
}
