import type { GenericApiRequest, GenericHttpApi } from 'yaschema-api';

interface OnDidReceiveResponseHandlerArgs {
  api: GenericHttpApi;
  req: GenericApiRequest;
  reqId: string;
  /** First request starts with 0 */
  retryCount: number;
  res: Response;
}

let globalOnDidReceiveResponseHandler: (args: OnDidReceiveResponseHandlerArgs) => void = () => {};

/** Gets the configured function that will be called just after a response is received */
export const getOnDidReceiveResponseHandler = () => globalOnDidReceiveResponseHandler;

/** Sets the configured function that will be called just after a response is received */
export const setOnDidReceiveResponseHandler = (handler: (args: OnDidReceiveResponseHandlerArgs) => void) => {
  globalOnDidReceiveResponseHandler = handler;
};

/** Triggers the configured function that will be called just after a response is received */
export const triggerOnDidReceiveResponseHandler = (args: OnDidReceiveResponseHandlerArgs) => {
  globalOnDidReceiveResponseHandler(args);
};
