import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { ApplicationLogs } from 'src/entities/application-logs.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ResponseService {

    constructor(
        @InjectRepository(ApplicationLogs)
        private readonly _logsRepo: Repository<ApplicationLogs>
    ) { }

    generateResponse(code: any, msg: string, data: any, req: Request) {
        try {
            const { originalUrl } = req;
            const payload = {
                message: msg,
                isError: false,
                route: originalUrl,
                status_code: code
            }

            const createLog = this._logsRepo.create(payload);
            this._logsRepo.save(createLog);

            if (code != 200) {
                throw new HttpException(msg, code)
            }

            return {
                code: code,
                message: msg,
                data: data
            }

        } catch (error) {
            console.log(error);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    //   async generateError(error: any, req?: Request) {

    //         try {
    //             let orignal_url: any;

    //             if (req) {
    //                 const { originalUrl } = req;
    //                 orignal_url = originalUrl;

    //             } else {
    //                 orignal_url = "Cron Job Failed"
    //             }

    //             const payload = {
    //                 message: error,
    //                 isError: true,
    //                 route: orignal_url,
    //                 status_code: HttpStatus.INTERNAL_SERVER_ERROR
    //             }

    //             const createLog = this._logsRepo.create(payload);
    //             await this._logsRepo.save(createLog);

    //             let msg = 'something went wrong !';
    //             let code = HttpStatus.INTERNAL_SERVER_ERROR
    //             if (error == 'jwt expired' || error == 'jwt malformed') {
    //                 msg = 'Auth token is expired! please re-login into system'
    //                 code = HttpStatus.UNAUTHORIZED
    //             }

    //             if (orignal_url != "Cron Job Failed") {
    //                 throw new HttpException(error, HttpStatus.BAD_REQUEST)
    //             }

    //             // throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)


    //         } catch (error:any) {
    //             throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    //         }
    //     }

    async generateError(error: any, req?: Request) {

        const originalUrl = req?.originalUrl ?? 'Cron Job Failed';

        const errorMessage =
            error instanceof HttpException
                ? error.getResponse()
                : error instanceof Error
                    ? error.message
                    : error;

        const payload = {
            message: typeof errorMessage === 'string'
                ? errorMessage
                : JSON.stringify(errorMessage),
            isError: true,
            route: originalUrl,
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        };

        try {
            const createLog = this._logsRepo.create(payload);
            await this._logsRepo.save(createLog);
        } catch (logError) {
            // Logging failure should not replace the original error.
            console.error('Error while saving error log:', logError);
        }

        let msg = 'Something went wrong!';
        let code = HttpStatus.INTERNAL_SERVER_ERROR;

        if (errorMessage === 'jwt expired' || errorMessage === 'jwt malformed') {
            msg = 'Auth token is expired! Please re-login into system';
            code = HttpStatus.UNAUTHORIZED;
        } else if (originalUrl !== 'Cron Job Failed') {
            msg = typeof errorMessage === 'string'
                ? errorMessage
                : JSON.stringify(errorMessage);

            code = HttpStatus.BAD_REQUEST;
        }

        throw new HttpException(msg, code);
    }
}