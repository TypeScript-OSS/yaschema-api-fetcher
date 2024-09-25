export interface FormDataConstructor {
  new (form?: HTMLFormElement): FormData;
  prototype: FormData;
}

let globalFormDataConstructor: FormDataConstructor | undefined;

/** Gets the configured `FormData` implementation */
export const getFormDataConstructor = () =>
  globalFormDataConstructor ??
  (typeof window !== 'undefined' ? window.FormData : typeof global !== 'undefined' ? global.FormData : undefined);

/** Use to override the `FormData` implementation, e.g. to use node-fetch */
export const setFormDataConstructor = (formDataConstructor: FormDataConstructor) => {
  globalFormDataConstructor = formDataConstructor;
};
