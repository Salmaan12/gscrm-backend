import { BadRequestException, Body, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { CreateProduct,CreateBrand,CreateBrandSKU,UpdateProduct,UpdateBrand,UpdateBrandSKU } from './product.dto';
import { ResponseService } from 'src/shared/services/response.service';
import { Product } from 'src/entities/product.entity';
import { ProductBrand } from 'src/entities/product-brand.entity';
import { ProductBrandSku } from 'src/entities/product-brand-sku.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from 'src/shared/services/jwt.service';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class ProductService {

    constructor(
        @InjectRepository(Product)
        private readonly _productRepo: Repository<Product>,
        @InjectRepository(ProductBrand)
        private readonly _productbrandRepo: Repository<ProductBrand>,
        @InjectRepository(ProductBrandSku)
        private readonly _productbrandskuRepo: Repository<ProductBrandSku>,
        @Inject("RESPONSE-SERVICE") private res: ResponseService,
        @Inject('JWT-SERVICE') private jwt: JwtService
    ) {}

    async getAllProductBrandSKUs(req: Request) {
        try {
            const products: Product[] = await this._productRepo.find({
                select: {
                    id: true,
                    name: true,
                    type: true,
                    isActive: true
                }
            });

            const brands: ProductBrand[] = await this._productbrandRepo.find({
                select: {
                    id: true,
                    name: true,
                    productId: true,
                    isActive: true
                }
            });

            const skus: ProductBrandSku[] = await this._productbrandskuRepo.find({
                select: {
                    id: true,
                    name: true,
                    productBrandId: true,
                    weightInGM: true,
                    isActive: true
                }
            });

            const responseResult = {
                products : products,
                brands : brands,
                skus : skus
            };

            return this.res.generateResponse(
                200,
                'Products retrieved successfully',
                responseResult,
                req
            );
        } catch (error) {
            return this.res.generateError(
                error || 'Something went wrong',
                req
            );
        }
    }

    async createProduct(body: CreateProduct, req: Request) {
        try {
    
            const { name, type, IsActive } = body;
    
            const checkProductAlreadyExists: Product[] = await this._productRepo.createQueryBuilder('product')
                    .where('product.name = :name AND product.type = :type', { name , type })
                    .execute();
    
            if (checkProductAlreadyExists.length > 0) {
                return this.res.generateError('Product with same name already exists', req);
            }
    
            const payload: Product | any = {
                    name: name,
                    type: type,
                    isActive: IsActive
            };
    
            const product = this._productRepo.create(payload);
            await this._productRepo.save(product);
    
            return this.res.generateResponse(
                    200,
                    'Product created successfully',
                    product,
                    req
            );
                
        } catch (error) {
            return this.res.generateError(
                    error || 'Something went wrong',
                    req
            );
        }
    }

    async createBrand(body: CreateBrand, req: Request) {
        try {
    
            const { name, productId, IsActive } = body;
    
            const checkBrandAlreadyExists: ProductBrand[] = await this._productbrandRepo.createQueryBuilder('brand')
                    .where('brand.name = :name AND brand.productId = :productId', { name , productId })
                    .execute();
    
            if (checkBrandAlreadyExists.length > 0) {
                return this.res.generateError('Brand with same name already exists', req);
            }
    
            const payload: ProductBrand | any = {
                    name: name,
                    productId: productId,
                    isActive: IsActive
            };
    
            const brand = this._productbrandRepo.create(payload);
            await this._productbrandRepo.save(brand);
    
            return this.res.generateResponse(
                    200,
                    'Brand created successfully',
                    brand,
                    req
            );
                
        } catch (error) {
            return this.res.generateError(
                    error || 'Something went wrong',
                    req
            );
        }
    }

    async createBrandSKU(body: CreateBrandSKU, req: Request) {
        try {
    
            const { name, productBrandId, IsActive, weightInGM } = body;
    
            const checkBrandSKUAlreadyExists: ProductBrandSku[] = await this._productbrandskuRepo.createQueryBuilder('brandsku')
                    .where('brandsku.name = :name AND brandsku.productBrandId = :productBrandId', { name , productBrandId })
                    .execute();
    
            if (checkBrandSKUAlreadyExists.length > 0) {
                return this.res.generateError('Brand SKU with same name already exists', req);
            }
    
            const payload: ProductBrandSku | any = {
                    name: name,
                    productBrandId: productBrandId,
                    weightInGM: weightInGM,
                    isActive: IsActive
            };
    
            const brandsku = this._productbrandskuRepo.create(payload);
            await this._productbrandskuRepo.save(brandsku);
    
            return this.res.generateResponse(
                    200,
                    'Brand SKU created successfully',
                    brandsku,
                    req
            );
                
        } catch (error) {
            return this.res.generateError(
                    error || 'Something went wrong',
                    req
            );
        }
    }

    async updateProduct(body: UpdateProduct, req: Request) {
        try {
    
            const { id, name, type, IsActive } = body;
    
            const checkProductAlreadyExists: Product[] = await this._productRepo.createQueryBuilder('product')
                    .where('product.id <> :id AND product.name = :name AND product.type = :type', { id, name , type })
                    .execute();
    
            if (checkProductAlreadyExists.length > 0) {
                return this.res.generateError('Product with same name already exists', req);
            }

            // Update Product in Database
            const updateproduct = await this._productRepo.createQueryBuilder('product')
                .update()
                .set({
                    name: name,
                    type: type,
                    isActive: IsActive
                })
                .where('id = :id', { id })
                .execute()

            // if product not update return error message
            if (!updateproduct.affected) throw new Error("product not updated, internal server issues");
    
            /// Return success message
            return this.res.generateResponse(HttpStatus.OK, "Product Updated Successfully", [], req);
                
        } catch (error) {
            return this.res.generateError(
                    error || 'Something went wrong',
                    req
            );
        }
    }

    async updateBrand(body: UpdateBrand, req: Request) {
        try {
    
            const { id, name, productId, IsActive } = body;
    
            const checkBrandAlreadyExists: ProductBrand[] = await this._productbrandRepo.createQueryBuilder('brand')
                    .where('brand.id <> :id AND brand.name = :name AND brand.productId = :productId', { id, name , productId })
                    .execute();
    
            if (checkBrandAlreadyExists.length > 0) {
                return this.res.generateError('Brand with same name already exists', req);
            }

            // Update Brand in Database
            const updatebrand = await this._productbrandRepo.createQueryBuilder('brand')
                .update()
                .set({
                    name: name,
                    productId: productId,
                    isActive: IsActive
                })
                .where('id = :id', { id })
                .execute()

            // if brand not update return error message
            if (!updatebrand.affected) throw new Error("brand not updated, internal server issues");
    
            /// Return success message
            return this.res.generateResponse(HttpStatus.OK, "Brand Updated Successfully", [], req);
                
        } catch (error) {
            return this.res.generateError(
                    error || 'Something went wrong',
                    req
            );
        }
    }

    async updateBrandSKU(body: UpdateBrandSKU, req: Request) {
        try {
    
            const { id, name, productBrandId, IsActive, weightInGM } = body;
    
            const checkBrandSKUAlreadyExists: ProductBrandSku[] = await this._productbrandskuRepo.createQueryBuilder('brandsku')
                    .where('brandsku.id <> :id AND brandsku.name = :name AND brandsku.productBrandId = :productBrandId', { id, name , productBrandId })
                    .execute();
    
            if (checkBrandSKUAlreadyExists.length > 0) {
                return this.res.generateError('Brand SKU with same name already exists', req);
            }

            // Update Brand SKU in Database
            const updatebrandsku = await this._productbrandskuRepo.createQueryBuilder('brandsku')
                .update()
                .set({
                    name: name,
                    productBrandId: productBrandId,
                    weightInGM: weightInGM,
                    isActive: IsActive
                })
                .where('id = :id', { id })
                .execute()

            // if brand sku not update return error message
            if (!updatebrandsku.affected) throw new Error("brand sku not updated, internal server issues");
    
            /// Return success message
            return this.res.generateResponse(HttpStatus.OK, "Brand SKU Updated Successfully", [], req);
                
        } catch (error) {
            return this.res.generateError(
                    error || 'Something went wrong',
                    req
            );
        }
    }

}
