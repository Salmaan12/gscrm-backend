import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Put, Request, UseGuards, Delete, Query, ParseArrayPipe, ValidationPipe, UsePipes } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateUpdateInventory,PaginationDto } from './inventory.dto';
import { Request as request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
export class InventoryController {

    constructor(
        @Inject("INVENTORY-SERVICE") private _inventory: InventoryService,
    ) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    createInventory(@Body() body: CreateUpdateInventory, @Request() req: request) {
        return this._inventory.createInventory(body, req);
    }

    @Put('update/:id')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    updateInventory(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: CreateUpdateInventory,
        @Request() req: request) {
        return this._inventory.updateInventory(id, body, req);
    }

    @Get('all/pagination')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    getAllInventoriesWithPagination(@Query() params: PaginationDto, @Request() req: request) {
        return this._inventory.getAllInventoriesWithPagination(params, req);
    }

    @Get('getInventoryById/:id')
    @UseGuards(JwtAuthGuard)
    findInventoryById(@Param('id') id: string, @Request() req: request) {
        return this._inventory.getInventoryById(id, req);
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    deleteInventoryById(@Param('id', ParseIntPipe) id: number, @Request() req: request) {
        return this._inventory.deleteInventoryById(id, req);
    }

    @Get('getInventorySnapshotByProduct')
    @UseGuards(JwtAuthGuard)
    getInventorySnapshotByProduct(@Request() req: request) {
        return this._inventory.getInventorySnapshotByProduct(req);
    }

    @Get('getInventorySnapshotByBrand/:productid')
    @UseGuards(JwtAuthGuard)
    getInventorySnapshotByBrand(@Param('productid', ParseIntPipe) productid: number, @Request() req: request) {
        return this._inventory.getInventorySnapshotByBrand(productid, req);
    }

    @Get('getInventorySnapshotBySKU/:brandid')
    @UseGuards(JwtAuthGuard)
    getInventorySnapshotBySKU(@Param('brandid', ParseIntPipe) brandid: number, @Request() req: request) {
        return this._inventory.getInventorySnapshotBySKU(brandid, req);
    }

}
