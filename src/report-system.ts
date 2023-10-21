import * as fs from 'fs';
import * as path from 'path';
import { ISimpleDB } from './file-database';

export interface UserInfo {
    id: string;
    name: string;
    msg: string;
}


export class ReportSystem {
    db: ISimpleDB;
    userdata = new Map<string, UserInfo>();

    constructor(db: ISimpleDB) {
        this.db = db;
        this.userdata = this.db.load();
    }

    reset() {
        this.userdata.forEach((val) => {
            val.msg = '';
        });

        // save to database
        this.db.save(this.userdata);
    }

    setUserMsg(userId: string, msg: string) {
        const data = this.userdata.get(userId);
        if (data) {
            this.userdata.set(userId, {
                ...data,
                msg: msg,
            });
        }
        else {
            throw Error("使用者 Id 輸入錯誤或不存在")
        }

        // save to database
        this.db.save(this.userdata);
    }

    format() {
        return Array.from(this.userdata.values())
            .map((val) => `${val.id} ${val.name}：${val.msg ? val.msg : '待查'}`)
            .join('\n');
    }

    remaining() {
        return Array.from(this.userdata.values())
            .filter((val) => val.msg === '')
            .map((val) => `@${val.id} ${val.name}`)
            .join('\n');
    }
}
