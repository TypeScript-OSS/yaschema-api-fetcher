import type { GenericApiRequest, GenericHttpApi } from 'yaschema-api';

interface OnDidRequestHandlerArgs {
  api: GenericHttpApi;
  req: GenericApiRequest;
  reqId: string;
  /** First request starts with 0 */
  retryCount: number;
}

let globalOnDidRequestHandler: (args: OnDidRequestHandlerArgs) => void = () => {};

/** Gets the configured function that will be called just after a request occurs */
export const getOnDidRequestHandler = () => globalOnDidRequestHandler;

/** Sets the configured function that will be called just after a request occurs */
export const setOnDidRequestHandler = (handler: (args: OnDidRequestHandlerArgs) => void) => {
  globalOnDidRequestHandler = handler;
};

/** Triggers the configured function that will be called just after a request occurs */
export const triggerOnDidRequestHandler = (args: OnDidRequestHandlerArgs) => {
  globalOnDidRequestHandler(args);
};
