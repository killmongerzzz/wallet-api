import WalletController from "./controller/Wallet/WalletController";

export const walletConnectorEvent = async (event: any, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return WalletController.Execute(event);
};
