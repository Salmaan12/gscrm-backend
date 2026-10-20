import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Put, Request, UseGuards, Delete, Query, ParseArrayPipe } from '@nestjs/common';
import { SalePointService } from './salepoint.service';
import { CreateSalePoint, SalePointDto } from './salepoint.dto';
import { Request as request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('salepoint')
export class SalePointController {

    constructor(
        @Inject("SALEPOINT-SERVICE") private _salepoint: SalePointService,
    ) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    createSalePointEntiries(@Body(new ParseArrayPipe({
        items: CreateSalePoint,
    }))
    body: CreateSalePoint[], @Request() req: request) {
        return this._salepoint.createSalePointEntiries(body, req);
    }

    @Get('all/dailyReport')
    @UseGuards(JwtAuthGuard)
    getAllSalePointEntiries(@Query() params: SalePointDto, @Request() req: request){
        return this._salepoint.getAllSalePointEntiries(params, req);
    }

    @Get('getSalePointEntiriesByReferenceNo/:referenceNo')
    @UseGuards(JwtAuthGuard)
    findSalePointEntiriesByReferenceNo(@Param('referenceNo') referenceNo: string) {
        return this._salepoint.findSalePointEntiriesByReferenceNo(referenceNo);
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    deleteSalePointEntryById(@Param('id', ParseIntPipe) id: number, @Request() req: request) {
        return this._salepoint.deleteSalePointEntryById(id,req);
    }

}
