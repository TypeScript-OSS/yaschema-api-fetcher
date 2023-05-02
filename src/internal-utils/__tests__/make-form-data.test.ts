import { FormData } from 'node-fetch';

import { setFormDataConstructor } from '../../config/form-data-constructor';
import { makeFormData } from '../make-form-data';

describe('makeFormData', () => {
  beforeAll(() => {
    setFormDataConstructor(FormData);
  });

  it('should work with empty object', () => {
    expect(getFormDataEntries(makeFormData({}))).toMatchObject([]);
  });

  it('should work with single value', () => {
    expect(getFormDataEntries(makeFormData({ hello: 'world' }))).toMatchObject([['hello', 'world']]);
  });

  it('should escape values appropriately', () => {
    expect(getFormDataEntries(makeFormData({ hello: '!@#$%' }))).toMatchObject([['hello', '!@#$%']]);
  });

  it('should work with multiple values', () => {
    expect(getFormDataEntries(makeFormData({ hello: 'world', goodbye: 'too' }))).toMatchObject([
      ['hello', 'world'],
      ['goodbye', 'too']
    ]);
  });

  it('should work with array values', () => {
    expect(getFormDataEntries(makeFormData({ hello: ['one', 'two', 'three'] }))).toMatchObject([
      ['hello[]', 'one'],
      ['hello[]', 'two'],
      ['hello[]', 'three']
    ]);
  });

  it('should work with mixed value types', () => {
    expect(getFormDataEntries(makeFormData({ one: 'one', two: 2, three: true, four: ['a', 'b', 'c&d'] }))).toMatchObject([
      ['one', 'one'],
      ['two', '2'],
      ['three', 'true'],
      ['four[]', 'a'],
      ['four[]', 'b'],
      ['four[]', 'c&d']
    ]);
  });
});

// Helpers

const getFormDataEntries = (formData: FormData) => {
  const output: Array<[string, string | Blob]> = [];

  formData.forEach((value, key) => {
    output.push([key, value]);
  });

  return output;
};
