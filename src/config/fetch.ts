export type Fetch = typeof fetch;

let globalFetch: Fetch | undefined;

/** Gets the configured `fetch` implementation */
export const getFetch = () => globalFetch ?? fetch;

/** Use to override the `fetch` implementation, e.g. to use node-fetch */
export const setFetch = (fetch: Fetch) => {
  globalFetch = fetch;
};
