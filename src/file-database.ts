import * as fs from 'fs';
import * as path from 'path';

import { UserInfo } from 'report-system';

export interface ISimpleDB {
    load(): Map<string, UserInfo>;

    save(data: Map<string, UserInfo>): void;
}

export class FileDB implements ISimpleDB {
    constructor() {}

    public load() {
        const data = new Map<string, UserInfo>();

        if (fs.existsSync(path.join(__dirname, 'data.json')) === false) {
            const streamData = fs.readFileSync(path.join(__dirname, 'member.json'), { encoding: 'utf-8' });
            const jsonData = JSON.parse(streamData);
            
            for (const [id, name] of Object.entries<string>(jsonData)) {
                data.set(id, {
                    id: id,
                    name: name,
                    msg: '',
                });
            }

            // save first time
            this.save(data);
            return data;
        }
        // if already have data
        else {
            const streamData = fs.readFileSync(path.join(__dirname, 'data.json'), { encoding: 'utf-8' });
            const jsonData = JSON.parse(streamData);
    
            for (const userinfo of Array.from<UserInfo>(jsonData)) {
                data.set(userinfo.id, userinfo);
            }
        }

        return data;
    }

    public save(data: Map<string, UserInfo>) {
        const streamData = JSON.stringify(Array.from(data.values()));
        fs.writeFileSync(path.join(__dirname, './data.json'), streamData, { encoding: 'utf-8' });
    }
}