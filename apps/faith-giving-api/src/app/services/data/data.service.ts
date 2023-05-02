import { Injectable } from '@nestjs/common';
import { getDatabase } from "firebase/database";

@Injectable()
export class DataService {

    private environment = process.env.NODE_ENV || 'development';
    
    private _dbPath: string;
    get dbPath() { return this._dbPath; }
    private set dbPath(value) { this._dbPath = value; }

    private database: any;

    constructor() {
        this.dbPath = this.environment === 'development' ? 'dev' : 'prod';
    }

    getDatabase() {
        if (this.database) {
            return this.database;
        }

        this.database = getDatabase();
        return this.database;
    }
}
