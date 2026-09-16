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
  ) {}

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

  async generateError(error: any, req?: Request) {

        try {
            let orignal_url: any;

            if (req) {
                const { originalUrl } = req;
                orignal_url = originalUrl;

            } else {
                orignal_url = "Cron Job Failed"
            }

            const payload = {
                message: error.message,
                isError: true,
                route: orignal_url,
                status_code: HttpStatus.INTERNAL_SERVER_ERROR
            }

            const createLog = this._logsRepo.create(payload);
            await this._logsRepo.save(createLog);

            let msg = 'something went wrong !';
            let code = HttpStatus.INTERNAL_SERVER_ERROR
            if (error.message == 'jwt expired' || error.message == 'jwt malformed') {
                msg = 'Auth token is expired! please re-login into system'
                code = HttpStatus.UNAUTHORIZED
            }

            if (orignal_url != "Cron Job Failed") {
                throw new HttpException(error.message, error.status)
            }


        } catch (error) {
            console.log(error);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}