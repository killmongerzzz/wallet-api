import DbBase from "../base/DBBase";

export interface WalletBaseDocument {
  id: string;
  name: string;
  credit: number;
  createdOn: number;
}

export default class WalletBaseDB extends DbBase<WalletBaseDocument> {
  constructor() {
    super("wallet_account_details");
  }

  get = async (id: string): Promise<WalletBaseDocument | undefined> => {
    return this.dbTable.get({
      id,
    });
  };

  update = async (
    data: WalletBaseDocument
  ): Promise<WalletBaseDocument | undefined> => {
    const id = data["id"];
    delete data["id"];
    return this.dbTable.update(id, data);
  };

  add = async (
    data: WalletBaseDocument
  ): Promise<WalletBaseDocument | undefined> => {
    return this.dbTable.create(data);
  };

  scan = async () => {
    return this.dbTable.scan().exec();
  };
}
