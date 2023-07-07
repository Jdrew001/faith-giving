import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class CryptService {

    get secret(): string { return process.env['SESSION_KEY'] as string; }

    encrypt(data: any) {
        return CryptoJS.AES.encrypt(JSON.stringify(data), this.secret).toString();
    }

    decrypt(data: any) {
        const bytes = CryptoJS.AES.decrypt(data, this.secret);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
}
