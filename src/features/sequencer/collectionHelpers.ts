declare global {
    interface Map<K, V> {
        getOrThrow(key: K): V
    }

    interface Array<T> {
        singleOrThrow(): T
    }
    
    interface Array<T> {
        findOrThrow(predicate: (value: T, index: number, obj: T[]) => unknown): T
    }
}

Map.prototype.getOrThrow = function <K, V>(this: Map<K, V>, key: K) {
    if (this.has(key)) {
        return this.get(key) as V
    }
    throw new Error(`Map key not found: ${key}`)
}

Array.prototype.singleOrThrow = function <T>(this: Array<T>) {
    if (this.length === 1) {
        return this[0] as T
    }
    else if (this.length > 1) {
        throw new Error('Unexpected array element(s) found')
    }
    else {
        throw new Error('Array element not found')
    }
}

Array.prototype.findOrThrow = function <T>(this: Array<T>, predicate: (value: T, index: number, obj: T[]) => unknown) {
    let el = this.find(predicate)
    if (el) {
        return el
    }
    throw new Error('Array element not found')
}

export { }
