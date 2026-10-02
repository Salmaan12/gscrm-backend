import { Body, Controller, Get, Inject, Post, Delete, Request, UseGuards, Param, ParseIntPipe  } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProduct,CreateBrand,CreateBrandSKU,UpdateProduct,UpdateBrand,UpdateBrandSKU } from './product.dto';
import { Request as request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductController {

    constructor(
        @Inject("PRODUCT-SERVICE") private _products: ProductService,
    ){}

    @Get('getAllProductBrandSKUs')
    @UseGuards(JwtAuthGuard)
    getAllProductBrandSKUs(@Request() req: request) {
        return this._products.getAllProductBrandSKUs(req);
    }

    @Post('createproduct')
    @UseGuards(JwtAuthGuard)
    createProduct(@Body() body: CreateProduct, @Request() req: request) {
        return this._products.createProduct(body,req);
    }

    @Post('createbrand')
    @UseGuards(JwtAuthGuard)
    createBrand(@Body() body: CreateBrand, @Request() req: request) {
        return this._products.createBrand(body,req);
    }

    @Post('createbrandsku')
    @UseGuards(JwtAuthGuard)
    createBrandSku(@Body() body: CreateBrandSKU, @Request() req: request) {
        return this._products.createBrandSKU(body,req);
    }

    @Post('updateproduct/:id')
    @UseGuards(JwtAuthGuard)
    updateProduct(@Param('id', ParseIntPipe) id: number,@Body() body: UpdateProduct, @Request() req: request) {
        return this._products.updateProduct(id,body,req);
    }

    @Post('updatebrand/:id')
    @UseGuards(JwtAuthGuard)
    updateBrand(@Param('id', ParseIntPipe) id: number,@Body() body: UpdateBrand, @Request() req: request) {
        return this._products.updateBrand(id,body,req);
    }

    @Post('updatebrandsku/:id')
    @UseGuards(JwtAuthGuard)
    updateBrandSku(@Param('id', ParseIntPipe) id: number,@Body() body: UpdateBrandSKU, @Request() req: request) {
        return this._products.updateBrandSKU(id,body,req);
    }

    @Delete('deleteproduct/:id')
    @UseGuards(JwtAuthGuard)
    deleteProduct(@Param('id', ParseIntPipe) id: number, @Request() req: request) {
        return this._products.deleteProduct(id,req);
    }

    @Delete('deletebrand/:id')
    @UseGuards(JwtAuthGuard)
    deleteBrand(@Param('id', ParseIntPipe) id: number, @Request() req: request) {
        return this._products.deleteBrand(id,req);
    }

    @Delete('deletebrandsku/:id')
    @UseGuards(JwtAuthGuard)
    deleteBrandSku(@Param('id', ParseIntPipe) id: number, @Request() req: request) {
        return this._products.deleteBrandSku(id,req);
    }

}
