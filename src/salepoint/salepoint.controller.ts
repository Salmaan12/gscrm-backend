import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Put, Request, UseGuards, Delete, Query, ParseArrayPipe, ValidationPipe, UsePipes } from '@nestjs/common';
import { SalePointService } from './salepoint.service';
import { CreateSalePoint, DailyReportSubmitDto, SalePointDto } from './salepoint.dto';
import { Request as request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('salepoint')
export class SalePointController {

    constructor(
        @Inject("SALEPOINT-SERVICE") private _salepoint: SalePointService,
    ) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    createSalePointEntiries(@Body(new ParseArrayPipe({
        items: CreateSalePoint,
    }))
    body: CreateSalePoint[], @Request() req: request) {
        return this._salepoint.createSalePointEntiries(body, req);
    }

    @Get('all/dailyReport')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    getAllSalePointEntiries(@Query() params: SalePointDto, @Request() req: request) {
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
        return this._salepoint.deleteSalePointEntryById(id, req);
    }

    @Get('all/customerledger')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    getAllSalePointEntiriesForCustomerledger(@Query() params: SalePointDto, @Request() req: request) {
        return this._salepoint.getAllSalePointEntiriesForCustomerledger(params, req);
    }

    @Get('dailyreport/submit')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    submitDailyReport(@Query() params: DailyReportSubmitDto, @Request() req: request) {
        return this._salepoint.submitDailyReport(params, req);
    }

    @Get('dailyreport/getInventorySnapshotOpening')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    getInventorySnapshotOpening(@Query() params: DailyReportSubmitDto, @Request() req: request) {
        return this._salepoint.getInventorySnapshotOpening(params, req);
    }


}
