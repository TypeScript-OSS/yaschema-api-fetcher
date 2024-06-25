import { makeQueryString } from '../make-query-string.js';

describe('makeQueryString', () => {
  it('should work with empty object', () => {
    expect(makeQueryString({})).toBe('');
  });

  it('should work with single value', () => {
    expect(makeQueryString({ hello: 'world' })).toBe('hello=world');
  });

  it('should escape values appropriately', () => {
    expect(makeQueryString({ hello: '!@#$%' })).toBe('hello=!%40%23%24%25');
  });

  it('should work with multiple values', () => {
    expect(makeQueryString({ hello: 'world', goodbye: 'too' })).toBe('hello=world&goodbye=too');
  });

  it('should work with array values', () => {
    expect(makeQueryString({ hello: ['one', 'two', 'three'] })).toBe('hello[]=one&hello[]=two&hello[]=three');
  });

  it('should work with mixed value types', () => {
    expect(makeQueryString({ one: 'one', two: 2, three: true, four: ['a', 'b', 'c&d'] })).toBe(
      'one=one&two=2&three=true&four[]=a&four[]=b&four[]=c%26d'
    );
  });
});
