import type { GenericShouldRetryEvaluator } from '../api-fetch/types/ShouldRetryEvaluator';

let globalDefaultShouldRetryEvaluator: GenericShouldRetryEvaluator | undefined = undefined;

export const getDefaultShouldRetryEvaluator = () => globalDefaultShouldRetryEvaluator;

export const setDefaultShouldRetryEvaluator = (shouldRetryEvaluator: GenericShouldRetryEvaluator | undefined) => {
  globalDefaultShouldRetryEvaluator = shouldRetryEvaluator;
};
