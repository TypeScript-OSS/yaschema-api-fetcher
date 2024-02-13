import type { GenericApiRequest, GenericHttpApi } from 'yaschema-api';

interface OnWillRequestHandlerArgs {
  api: GenericHttpApi;
  req: GenericApiRequest;
  reqId: string;
  /** First request starts with 0 */
  retryCount: number;
}

let globalOnWillRequestHandler: (args: OnWillRequestHandlerArgs) => void = () => {};

/** Gets the configured function that will be called just before a request occurs */
export const getOnWillRequestHandler = () => globalOnWillRequestHandler;

/** Sets the configured function that will be called just before a request occurs */
export const setOnWillRequestHandler = (handler: (args: OnWillRequestHandlerArgs) => void) => {
  globalOnWillRequestHandler = handler;
};

/** Triggers the configured function that will be called just before a request occurs */
export const triggerOnWillRequestHandler = (args: OnWillRequestHandlerArgs) => {
  globalOnWillRequestHandler(args);
};
