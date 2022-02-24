import CommonUtils from "../utils/CommonUtils";
import * as allSchemas from "../db/schema.json";
import DynamoDB from "dynamoose";

export default abstract class DbBase<T> {
  protected dbTable: any;

  constructor(table: string) {
    const dbTableSchema: any = CommonUtils.findItemInArray(
      allSchemas["default"],
      "TableName",
      table
    );
    if (dbTableSchema) {
      this.dbTable = DynamoDB.model(
        table,
        new DynamoDB.Schema(
          dbTableSchema["Schema"],
          dbTableSchema["SchemaOptions"]
        ),
        dbTableSchema["Options"] || {}
      );
    } else {
      throw new Error(`DBTable_NOT_FOUND:${table}`);
    }
  }
}
