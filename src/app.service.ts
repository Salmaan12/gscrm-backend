import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello() {
    return {
      code: 200,
      msg: 'Api is working fine and !!! health 100%',
    };
  }
}
