export function isEmpty(val: unknown) {
    return val == null || !(Object.keys(val) || val).length;
}

export function difference<Item>(arr1: Item[], arr2: Item[]) {
    return arr1.filter(x => !arr2.includes(x))
}

export function pick<Obj extends Record<string, unknown>, K extends keyof Obj>(object?: Obj, ...keys: K[]): { [P in K]: Obj[P] } {
    return object 
        ? Object.fromEntries(
            Object.entries(object)
                .filter(([key, value]) => keys.includes(key as K) && value !== undefined)
        ) as { [P in K]: Obj[P] }
        : {} as { [P in K]: Obj[P] }
}

export function camelCase(string: string) {
    return string
    .replace(/([^A-Z])([A-Z])/g, '$1 $2') // "aB" become "a B"
    .toLowerCase()
    .replace(/[^a-z0-9]/ig, ' ')
    .trim()
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

export function snakeCase(string: string) {
    const matches = string.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+|[A-Z]|[0-9]+/g)
    return matches ? matches.map(s => s.toLowerCase()).join('_') : '';
}
