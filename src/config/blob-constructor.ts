export interface BlobConstructor {
  new (form?: HTMLFormElement | undefined): Blob;
  prototype: Blob;
}

let globalBlobConstructor: BlobConstructor | undefined;

/** Gets the configured `Blob` implementation */
export const getBlobConstructor = () =>
  globalBlobConstructor ?? (typeof window !== 'undefined' ? window.Blob : typeof global !== 'undefined' ? global.Blob : undefined);

/** Use to override the `Blob` implementation, e.g. to use node-fetch */
export const setBlobConstructor = (blobConstructor: BlobConstructor) => {
  globalBlobConstructor = blobConstructor;
};
