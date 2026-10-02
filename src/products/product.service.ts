import { BadRequestException, Body, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { CreateProduct,CreateBrand,CreateBrandSKU,UpdateProduct,UpdateBrand,UpdateBrandSKU } from './product.dto';
import { ResponseService } from 'src/shared/services/response.service';
import { Product } from 'src/entities/product.entity';
import { ProductBrand } from 'src/entities/product-brand.entity';
import { ProductBrandSku } from 'src/entities/product-brand-sku.entity';
import { ProductBrandSkuMaking } from 'src/entities/product-brand-sku-making.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
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
        @InjectRepository(ProductBrandSkuMaking)
        private readonly _productbrandskumakingRepo: Repository<ProductBrandSkuMaking>,
        @Inject("RESPONSE-SERVICE") private res: ResponseService
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
                    isActive: true,
                    makings: {
                        makingCharges: true,
                        id: true // Required by TypeORM to map relations properly
                    }
                },
                relations: {
                    makings: true
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
    
            const { name, productBrandId, IsActive, weightInGM, makingCharges } = body;
    
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
            const savedBrandSku = await this._productbrandskuRepo.save(brandsku);

            // const payloadskumaking: ProductBrandSkuMaking | any = {
            //         productBrandSkuId: savedBrandSku[0].id,
            //         makingCharges: makingCharges,
            //         isActive: IsActive
            // };
    
            // const brandskumaking = this._productbrandskumakingRepo.create(payloadskumaking);
            
            const makingChargesPayload = this._productbrandskumakingRepo.create({
                    makingCharges: makingCharges, 
                    isActive: IsActive,
                    productBrandSku: savedBrandSku as any
            });

            await this._productbrandskumakingRepo.save(makingChargesPayload);
    
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

    async updateProduct(id: number,body: UpdateProduct, req: Request) {
        try {
    
            const { name, type, IsActive } = body;
    
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

    async updateBrand(id: number,body: UpdateBrand, req: Request) {
        try {
    
            const { name, productId, IsActive } = body;
    
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

    async updateBrandSKU(id: number,body: UpdateBrandSKU, req: Request) {
        try {
    
            const { name, productBrandId, IsActive, weightInGM, makingCharges } = body;
    
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

            // Update Brand SKU Making in Database
            const updatebrandskumaking = await this._productbrandskumakingRepo.createQueryBuilder('brandskumaking')
                .update()
                .set({
                    makingCharges: makingCharges,
                    isActive: IsActive
                })
                .where('productBrandSkuId = :id', { id })
                .execute()

            // if brand sku and making not update return error message
            if (!updatebrandsku.affected || !updatebrandskumaking.affected) throw new Error("brand sku not updated, internal server issues");
    
            /// Return success message
            return this.res.generateResponse(HttpStatus.OK, "Brand SKU Updated Successfully", [], req);
                
        } catch (error) {
            return this.res.generateError(
                    error || 'Something went wrong',
                    req
            );
        }
    }

    async deleteProduct(id: number, req: Request) {
        try {

            const checkProductExists = await this._productRepo.findOne({
                where: {
                    id: id,
                },
            });
    
            if (!checkProductExists) {
                return this.res.generateError('Product not found',req);
            }
            
            const result = await this._productRepo.delete(id);

            if (result.affected === 0) {
                return this.res.generateError('Product not found',req);
            }
    
            /// Return success message
            return this.res.generateResponse(HttpStatus.OK, "Product Deleted Successfully", [], req);
                
        } catch (error) {
            return this.res.generateError(
                    error || 'Something went wrong',
                    req
            );
        }
    }

    async deleteBrand(id: number, req: Request) {
        try {

            const checkBrandExists = await this._productbrandRepo.findOne({
                where: {
                    id: id,
                },
            });
    
            if (!checkBrandExists) {
                return this.res.generateError('Brand not found',req);
            }
            
            const result = await this._productbrandRepo.delete(id);

            if (result.affected === 0) {
                return this.res.generateError('Brand not found',req);
            }
    
            /// Return success message
            return this.res.generateResponse(HttpStatus.OK, "Brand Deleted Successfully", [], req);
                
        } catch (error) {
            return this.res.generateError(
                    error || 'Something went wrong',
                    req
            );
        }
    }

    async deleteBrandSku(id: number, req: Request) {
        try {

            const checkBrandSkuExists = await this._productbrandskuRepo.findOne({
                where: {
                    id: id,
                },
            });
    
            if (!checkBrandSkuExists) {
                return this.res.generateError('Brand Sku not found',req);
            }
            
            const result = await this._productbrandskuRepo.delete(id);

            if (result.affected === 0) {
                return this.res.generateError('Brand Sku not found',req);
            }
    
            /// Return success message
            return this.res.generateResponse(HttpStatus.OK, "Brand Sku Deleted Successfully", [], req);
                
        } catch (error) {
            return this.res.generateError(
                    error || 'Something went wrong',
                    req
            );
        }
    }

}
