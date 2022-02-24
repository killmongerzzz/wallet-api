import DbBase from "../base/DBBase";
export enum TransactionType {
  WITHDRAW = "WITHDRAW",
  CREDIT = "CREDIT",
}
export interface WalletTransDocument {
  id: string;
  credit: number;
  type: TransactionType;
  description: string;
  walletId: string;
  createdOn: number;
  balance: number;
}

export default class WalletTansDB extends DbBase<WalletTransDocument> {
  constructor() {
    super("wallet_trans_history");
  }

  get = async (id: string): Promise<WalletTransDocument[]> => {
    return this.dbTable.query("walletId").eq(id).all().exec();
  };

  add = async (
    data: WalletTransDocument
  ): Promise<WalletTransDocument | undefined> => {
    return this.dbTable.create(data);
  };
}
