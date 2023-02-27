import { Database } from 'arangojs'
import { Config } from 'arangojs/connection';

import { ConnectionProvider } from '@/connection/ConnectionProvider';
import { Connection } from '@/connection/Connection';
import { DatabaseType } from './DatabaseType';
import ShortUniqueId from "short-unique-id";
import { ArangoDBConnection } from './ArangoDBConnection';
import { ArangoDbResultMapper } from '@/mapper/ArangoDbResultMapper';
const shortId = new ShortUniqueId({ length: 7 });


export class ArangoDBConnectionProvider implements ConnectionProvider {
        private driver: Database;
    
        constructor(
            readonly name: string,
            readonly type: DatabaseType,
            readonly host: string = '127.0.0.1',
            readonly port: number = 8529,
            readonly user: string,
            readonly password: string | undefined,
            readonly database: string | '_system',
            readonly protocol: string = 'http',
            readonly config: Config
        ) {
            this.driver = new Database({
                url: `${this.protocol}://${this.host}:${this.port}`,
                auth: {
                    username: this.user,
                    password: this.password
                }
            })
        }
    
        async connect(): Promise<Connection> {
            const session = this.driver.database(this.database);
            session['sessionId'] = shortId();
            const connection = new ArangoDBConnection(session, new ArangoDbResultMapper());
            return Promise.resolve(connection);
        }
    
        async end(): Promise<void> {
            return Promise.resolve(this.driver.close());
        }
    }
    