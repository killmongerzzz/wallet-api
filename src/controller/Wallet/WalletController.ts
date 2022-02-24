import { HttpEvent } from "../../model/HttpEvent";
import ApiResponse from "../../utils/ApiResponse";
import CommonUtils from "../../utils/CommonUtils";
import WalletDB from "../../dal/WalletDB";
import WalletTransDB, { TransactionType } from "../../dal/WalletTransDB";
import { v1 } from "uuid";
import _ from "lodash";
export interface WalletConfig {
  eventType: string;
  walletName: string;
  credit: number;
  transDescription: string;
  id: string;
  pageSize: number;
  startIndex: number;
  token: string;
}
export default class WalletController {
  config: WalletConfig;
  constructor(event: HttpEvent) {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    console.log("body", body);
    this.config = {
      eventType: event.pathParameters?.eventType || "",
      walletName: body?.name || "",
      credit: body?.balance || body?.amount || 0,
      transDescription: body?.description || "",
      id: event.queryStringParameters?.id || "",
      startIndex: event.queryStringParameters?.skip || 0,
      pageSize: event.queryStringParameters?.limit || 0,
      token:
        event.headers && event.headers["x-app-token"]
          ? event.headers["x-app-token"]
          : "",
    };
  }

  private validate = () => {
    return (
      ["setup", "transactions", "transact", "wallet", "wallets"].indexOf(
        this.config.eventType
      ) >= 0
    );
  };

  private wallets = async () => {
    try {
      console.log("wallets");
      return ApiResponse.success(await new WalletDB().scan());
    } catch (error) {
      throw error;
    }
  };

  private setup = async () => {
    try {
      if (
        !CommonUtils.isAllValidKeyValues(this.config, ["walletName", "credit"])
      ) {
        return ApiResponse.methodNotAllowed(
          "Either Wallet Name or Amount is missing"
        );
      }
      const id = v1();
      const wallet = await new WalletDB().add({
        id: id,
        name: this.config.walletName,
        credit: this.config.credit,
        createdOn: new Date().getTime(),
      });
      const walletTrans = await new WalletTransDB().add({
        id: v1(),
        credit: this.config.credit,
        type: TransactionType.CREDIT,
        description: "Opening Wallet",
        walletId: id,
        balance: this.config.credit,
        createdOn: new Date().getTime(),
      });
      return ApiResponse.success({
        id: wallet?.id,
        credit: wallet?.credit,
        date: wallet?.createdOn,
        transactionId: walletTrans?.id,
      });
    } catch (error) {
      throw error;
    }
  };

  private wallet = async () => {
    try {
      if (!CommonUtils.isAllValidKeyValues(this.config, ["id"])) {
        return ApiResponse.methodNotAllowed("Wallet Id is missing");
      }
      const wallet = await new WalletDB().get(this.config.id);
      return ApiResponse.success(wallet);
    } catch (error) {
      throw error;
    }
  };

  private transactions = async () => {
    try {
      if (
        !CommonUtils.isAllValidKeyValues(this.config, [
          "id",
          "pageSize",
          "startIndex",
        ])
      ) {
        return ApiResponse.methodNotAllowed(
          "Wallet Id or Page Size or Start Index is missing"
        );
      }
      const trans = await new WalletTransDB().get(this.config.id);
      return ApiResponse.success({
        records: _.orderBy(trans, ["createdOn"], ["desc"]).slice(
          this.config.startIndex,
          trans.length < this.config.startIndex + this.config.pageSize
            ? trans.length
            : this.config.startIndex + this.config.pageSize
        ),
        count: trans.length,
      });
    } catch (error) {
      throw error;
    }
  };

  private transact = async () => {
    try {
      console.log("transact", this.config);
      if (
        !CommonUtils.isAllValidKeyValues(this.config, [
          "id",
          "transDescription",
          "credit",
        ])
      ) {
        return ApiResponse.methodNotAllowed(
          "Either Wallet Id,Transaction Description or Amount is missing"
        );
      }
      const walletDB = new WalletDB();
      let wallet = await walletDB.get(this.config.id);
      if (!wallet) {
        return ApiResponse.methodNotAllowed("Either Wallet Id is incorrect");
      }
      wallet.credit = wallet.credit + this.config.credit;
      console.log("wallet", wallet);
      const walletTrans = await new WalletTransDB().add({
        id: v1(),
        credit: this.config.credit,
        type:
          this.config.credit > 0
            ? TransactionType.CREDIT
            : TransactionType.WITHDRAW,
        balance: wallet.credit,
        description: this.config.transDescription,
        walletId: this.config.id,
        createdOn: new Date().getTime(),
      });
      console.log("walletTrans", walletTrans);
      wallet = await walletDB.update(wallet);
      console.log("wallet", wallet);
      return ApiResponse.success({
        balance: wallet?.credit,
        transactionId: walletTrans?.id,
      });
    } catch (error) {
      throw error;
    }
  };

  static async Execute(event: any) {
    try {
      console.log("Execute", event);
      const handler = new WalletController(event);
      if (handler.config.token !== process.env.APP_TOKEN) {
        return ApiResponse.validationKeysMissing();
      }
      if (!handler.validate()) {
        return ApiResponse.methodNotAllowed("Path Parameters in not allowed");
      }
      return await handler[handler.config.eventType]();
    } catch (error) {
      console.log("error", error, error.stack);
      return ApiResponse.badRequest();
    }
  }
}
