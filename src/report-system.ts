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

    constructor(db: ISimpleDB) {
        this.db = db;
    }

    async reset() {
        const userdata = await this.db.load();

        userdata.forEach((val) => {
            val.msg = '';
        });

        // save to database
        this.db.save(userdata);
    }

    async setUserMsg(userId: string, msg: string) {
        await this.db.update(userId, msg);
    }

    async format() {
        const userdata = await this.db.load();
        return Array.from(userdata.values())
            .map((val) => `${val.id} ${val.name}：${val.msg ? val.msg : '待查'}`)
            .join('\n');
    }

    async remaining() {
        const userdata = await this.db.load();
        return Array.from(userdata.values())
            .filter((val) => val.msg === '')
            .map((val) => `@${val.id} ${val.name}`)
            .join('\n');
    }
}
