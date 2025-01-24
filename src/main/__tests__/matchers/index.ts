import { expect } from '@jest/globals';
import type { MatcherFunction } from 'expect';

const toMatchURL: MatcherFunction<[expected: unknown]> = 
	function(actual, expected) {
		if (
      (typeof actual !== 'string' && !(actual instanceof URL)) ||
      (typeof expected !== 'string' && !(expected instanceof URL))
    ) {
      throw new TypeError('These must be of type string or URL!');
    }

		// eslint-disable-next-line compat/compat
		const actualUrl = new URL(actual)
		// eslint-disable-next-line compat/compat
		const expectedUrl = new URL(expected)

		const pass = 
			this.equals(
				`${actualUrl.protocol}//${actualUrl.hostname}${actualUrl.pathname}`,
				`${expectedUrl.protocol}//${expectedUrl.hostname}${expectedUrl.pathname}`
			) &&
			this.equals(
				Object.fromEntries(actualUrl.searchParams.entries()),
				Object.fromEntries(expectedUrl.searchParams.entries())
			)
		return {
			message: () =>
				`expected ${actual} to match ${this.utils.printExpected(
					`${expected}`,
				)}`,
			pass,
		};
	}

expect.extend({
	toMatchURL,
});

declare global {
	namespace jest {
    interface Expect {
			toMatchURL(url: string | URL): void;
		}
		interface Matchers<R> {
			toMatchURL(url: string | URL): R;
		}
		interface InverseAsymmetricMatchers {
			toMatchURL(url: string | URL): void;
		}
	}
}