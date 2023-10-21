import * as fs from 'fs';
import * as path from 'path';
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { getFirestore, Firestore, collection, getDocs, setDoc, doc, updateDoc } from 'firebase/firestore/lite';

import { ISimpleDB } from "./file-database";
import { UserInfo } from "./report-system";

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || '';
const FIREBASE_AUTH_DOMAIN = process.env.FIREBASE_AUTH_DOMAIN || '';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || '';
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || '';
const FIREBASE_MESSAGE_SENDER_ID = process.env.FIREBASE_MESSAGE_SENDER_ID || '';
const FIREBASE_APP_ID = process.env.FIREBASE_APP_ID || '';
const FIREBASE_MEASUREMENT_ID = process.env.FIREBASE_MEASUREMENT_ID || '';

export class FireBaseDB implements ISimpleDB {
    readonly firebaseApp: FirebaseApp;
    readonly db: Firestore;
    constructor() {
        const firebaseConfig: FirebaseOptions = {
            apiKey: FIREBASE_API_KEY,
            authDomain: FIREBASE_AUTH_DOMAIN,
            projectId: FIREBASE_PROJECT_ID,
            storageBucket: FIREBASE_STORAGE_BUCKET,
            messagingSenderId: FIREBASE_MESSAGE_SENDER_ID,
            appId: FIREBASE_APP_ID,
            measurementId: FIREBASE_MEASUREMENT_ID
        };
        this.firebaseApp = initializeApp(firebaseConfig);
        this.db = getFirestore(this.firebaseApp);
    }

    async update(id: string, msg: String) {
        try {
            const data = await this.load();
            if (data.has(id)) {
                await setDoc(doc(this.db, 'LineBotData', id), { msg: msg }, { merge: true });
            }
            else {
                throw Error("User Not Found")
            }
        }
        catch (error) {
            console.log(`Update ${id} Error`);
            throw Error("使用者 Id 輸入錯誤或不存在")
        }
    }

    async load() {
        try {
            const dataCollection = collection(this.db, 'LineBotData');
            const userDocument = await getDocs(dataCollection);
            
            const data = new Map<string, UserInfo>();

            if (userDocument.docs.length <= 0) {
                const streamData = fs.readFileSync(path.join(__dirname, 'member.json'), { encoding: 'utf-8' });
                const jsonData = JSON.parse(streamData);
                
                for (const [id, name] of Object.entries<string>(jsonData)) {
                    const obj =  {
                        id: id,
                        name: name,
                        msg: '',
                    };
                    data.set(id, obj);
                }
                await this.save(data);
                return data;
            }
            else {
                const userData = userDocument.docs.map((val) => val.data()) as UserInfo[];
                for (const userinfo of userData) {
                    data.set(userinfo.id, userinfo);
                }
                return data;
            }
        }
        catch (error) {
            console.log('Load Data Error');
            throw Error("載入資料失敗")
        }
    }

    async save(data: Map<string, UserInfo>) {
        try {
            for (const [id, info] of data.entries()) {
                const userDocument = await setDoc(doc(this.db, 'LineBotData', id), info);
            }
        }
        catch (error) {
            console.log('Save Data Error');
            throw Error("儲存資料失敗")
        }
    }
}