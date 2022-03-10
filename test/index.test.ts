import mylib from '../src';
import { getTime } from '../src/utils';

/**
 * Dummy test
 */
describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy();
  });

  it('mylib is instantiable', () => {
    expect(mylib).toBeInstanceOf(Object);
  });

  it('mylib is instantiable', () => {
    expect(typeof getTime()).toEqual('number');
  });
});
