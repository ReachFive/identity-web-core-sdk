import { camelCase, difference, isEmpty, pick, snakeCase } from "../utils"

describe('isEmpty', () => {
    test('null', () => {
        expect(isEmpty(null)).toBeTruthy()
    })

    test('[]', () => {
        expect(isEmpty([])).toBeTruthy()
    })

    test('{}', () => {
        expect(isEmpty({})).toBeTruthy();
    })

    test('""', () => {
        expect(isEmpty("")).toBeTruthy();
    })

    test('[1, 2, 3]', () => {
        expect(isEmpty([1, 2, 3])).toBeFalsy();
    })

    test('{ a: 1 }', () => {
        expect(isEmpty({ a: 1 })).toBeFalsy();
    })

    test('"not empty"', () => {
        expect(isEmpty("text")).toBeFalsy();
    })

    test('123', () => {
        expect(isEmpty(123)).toBeTruthy(); // type is not considered a collection
    })

    test('true', () => {
        expect(isEmpty(true)).toBeTruthy(); // type is not considered a collection
    })

    test('new Set()', () => {
        expect(isEmpty(new Set())).toBeTruthy();
    })

    test('new Map()', () => {
        expect(isEmpty(new Map())).toBeTruthy();
    })
})

describe('difference', () => {
    it("difference", () => {
        const obtained = difference([2, 1], [3, 2])
        expect(obtained).toEqual([1])
    })
})

describe('pick', () => {
    it("should pick only listed properties whose are not undefined", () => {
        const obtained = pick({ a: 1, b: 'text', c: undefined }, 'a', 'b', 'c')
        expect(obtained).toMatchObject({ a: 1, b: 'text' })
    })
})

/** @see https://lodash.com/docs/4.17.15#camelCase */
describe('camelCase', () => {
    test('should transform string', () => {
        expect(camelCase('Foo 1 Bar 1')).toEqual('foo1Bar1')
        expect(camelCase('--foo-1-bar-1--')).toEqual('foo1Bar1')
        expect(camelCase('__FOO_1_BAR_1__')).toEqual('foo1Bar1')
        expect(camelCase('foo_bar')).toEqual('fooBar')
        expect(camelCase('fooBar')).toEqual('fooBar')
    })
})

/** @see https://lodash.com/docs/4.17.15#snakeCase */
describe('snakeCase', () => {
    test('should transform string', () => {
        expect(snakeCase('Foo 1 Bar 1')).toEqual('foo_1_bar_1')
        expect(snakeCase('foo1Bar1')).toEqual('foo_1_bar_1')
        expect(snakeCase('--FOO-1-BAR-1--')).toEqual('foo_1_bar_1')
        expect(snakeCase('foo_bar')).toEqual('foo_bar')
        expect(snakeCase('fooBar')).toEqual('foo_bar')
    })
})