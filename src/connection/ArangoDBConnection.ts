import { DrivineLogger } from "@/logger/DrivineLogger";
import { Connection } from "@/connection/Connection"
import { isArangoTransaction, Transaction } from "arangojs/transaction";
import { QuerySpecification, CursorSpecification, Cursor, ResultMapper, StatementLogger } from "..";
import { Database } from "arangojs";
import { ArangoDbSpecCompiler } from "@/query/ArangoDbSpecCompiler";

export class ArangoDBConnection implements Connection {
    private logger = new DrivineLogger(ArangoDBConnection.name)
    private transaction: Transaction;

    constructor(readonly session: Database, readonly resultMapper: ResultMapper) {}

    sessionId(): string {
        return this.session['sessionId'];
    }

    async query<T>(spec: QuerySpecification<T>): Promise<any[]> {
        const finalizedSpec = spec.finalizedCopy('AQL');
        const compiledSpec = new ArangoDbSpecCompiler(finalizedSpec).compile()
        const hrStart = process.hrtime()
        const logger = new StatementLogger(this.sessionId());
        const result = await this.session.query(compiledSpec.statement, compiledSpec.parameters);
        logger.log(spec, hrStart);

        return this.resultMapper.mapQueryResults<T>(result.records, finalizedSpec);
    }
    async openCursor<T>(cursorSpec: CursorSpecification<T>): Promise<Cursor<T>> {
        throw new Error("Method not implemented.");
    }
    async startTransaction(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async commitTransaction(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async rollbackTransaction(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async release(err?: Error | undefined): Promise<void> {
        throw new Error("Method not implemented.");
    }
}