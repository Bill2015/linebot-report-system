import * as fs from 'fs';
import * as path from 'path';

export interface User {
    id: string;
    name: string;
    msg: string;
}


export class ReportSystem {
    userdata = new Map<string, User>();

    constructor() {
        const data = fs.readFileSync(path.join(__dirname, 'member.json'), { encoding: 'utf-8' });
        const jsonData = JSON.parse(data);
        
        for (const [id, name] of Object.entries<string>(jsonData)) {
            this.userdata.set(id, {
                id: id,
                name: name,
                msg: '',
            });
        }
    }

    reset() {
        this.userdata.forEach((val) => {
            val.msg = '';
        });
    }

    setUserMsg(userId: string, msg: string) {
        const data = this.userdata.get(userId);
        if (data) {
            this.userdata.set(userId, {
                ...data,
                msg: msg,
            })
        }
        else {
            throw Error("使用者 Id 輸入錯誤或不存在")
        }
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
