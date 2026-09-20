import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {

    createAuthToken(payload:any){
        const authToken = jwt.sign(payload, process.env.JWT_SECRETE!, {expiresIn: '1d'})
        return authToken;
    }

    decode(token: string){
        const decode = jwt.verify(token, process.env.JWT_SECRETE!);
        return decode;
    }

}
