import { populateParamMarkersInUrl } from '../populate-param-markers-in-url.js';

describe('populateParamMarkersInUrl', () => {
  it('should support zero params', () => {
    expect(populateParamMarkersInUrl('http://www.fakedomain.com/hello/go', {})).toBe('http://www.fakedomain.com/hello/go');
  });

  it('should support basic params', () => {
    expect(populateParamMarkersInUrl('http://www.fakedomain.com/{myParam}/go', { myParam: 'hello' })).toBe(
      'http://www.fakedomain.com/hello/go'
    );
  });

  it('should support params needing URL encoding', () => {
    expect(populateParamMarkersInUrl('http://www.fakedomain.com/{myParam}/go', { myParam: 'foo/bar' })).toBe(
      'http://www.fakedomain.com/foo%2Fbar/go'
    );
  });

  it('should support reused params', () => {
    expect(populateParamMarkersInUrl('http://www.fakedomain.com/{myParam}/{myParam}/go', { myParam: 'hello' })).toBe(
      'http://www.fakedomain.com/hello/hello/go'
    );
  });

  it('should support multiple params', () => {
    expect(populateParamMarkersInUrl('http://www.fakedomain.com/{myParam1}/{myParam2}/go', { myParam1: 'hello', myParam2: 'world' })).toBe(
      'http://www.fakedomain.com/hello/world/go'
    );
  });

  it('should throw error if there are missing params', () => {
    expect(() => populateParamMarkersInUrl('http://www.fakedomain.com/{myParam1}/{myParam2}/go', { myParam1: 'hello' })).toThrowError();
  });
});
