import { BadRequestException, Injectable } from '@nestjs/common';
import { getDatabase } from "firebase/database"; 
import * as admin from 'firebase-admin';

import {
    addDoc,
    collection,
    collectionGroup,
    CollectionReference,
    connectFirestoreEmulator,
    deleteDoc,
    doc,
    getFirestore
  } from "firebase/firestore";
import { AppConstants } from '../../app.constant';

@Injectable()
export class DataService {

    private environment = process.env.NODE_ENV || 'development';
    
    private _dbPath: string;
    get dbPath() { return this._dbPath; }
    private set dbPath(value) { this._dbPath = value; }

    private database: any;

    firestore: any;

    private _firestorePath: string;
    get firestorePath() { return this._firestorePath; }
    private set firestorePath(value) { this._firestorePath = value; }

    constructor(
    ) {
        this.dbPath = this.environment === 'development' ? 'dev' : 'prod';
        this.firestorePath = this.environment === 'development' ? '/dev' : '/prod';
        setTimeout(() => {this.initDB();},1);
    }

    collection<T>(...pathSegments: string[]) {
        return collection(this.firestore, `${AppConstants.APP_PATH}${this.firestorePath}`, ...pathSegments);
    }

    initDB() {
        if (this.firestore) {
            return;
        }

        try {
            this.firestore = getFirestore();
        } catch (error) {
            throw new BadRequestException('An error occurred', { cause: new Error(), description: 'error retrieving firestore instance' })
        }
    }
}
