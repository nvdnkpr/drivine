import { Edge } from "arangojs/documents";
import { GraphResultMapper } from "./GraphResultMapper";

export class ArangoDbResultMapper extends GraphResultMapper {
  keys(record: any): string[] {
    return record.keys;
  }

  itemAtIndex(record: any, index: number): any {
    return record.get(index);
  }

  toNative(val: any): any {
    if (val == undefined) {
      return val;
    }
    if (Array.isArray(val)) {
      return val.map((a) => this.toNative(a));
    }

    if (this.isDocumentOrEdge(val)) {
      return this.toNative(val.properties);
    }

    if (typeof val === 'object') {
      return this.mapObj(this.toNative.bind(this), val);
    }
    return val;
  }

  private isDocumentOrEdge(doc: any): doc is Edge {
    const isDocument = (doc._key !== undefined && doc._id !== undefined && doc._rev !== undefined)
    const isEdge = (doc._to !== undefined && doc._from !== undefined)
    return isDocument || isEdge;
  }

  private mapObj(fn: Function, obj: any): any {
    const out = {};
    Object.keys(obj).forEach((key) => {
      out[key] = fn(obj[key]);
    });
    return out;
  }
}
