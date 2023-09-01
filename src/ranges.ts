export function isInRange(value: number,
    min: number, inclusiveMin: boolean,
    max: number, inclusiveMax: boolean) {

    if (value == null || min == null || max == null) {
        throw new Error('Invalid range input')
    }

    if (isNaN(value) || isNaN(min) || isNaN(max) || min > max) {
        throw new Error('Invalid range input')
    }

    if (inclusiveMin && value < min) {
        return false
    }

    if (!inclusiveMin && value <= min) {
        return false
    }

    if (inclusiveMax && value > max) {
        return false
    }

    if (!inclusiveMax && value >= max) {
        return false
    }

    return true
}

export function isValidVolume(value: number) {
    return isInRange(value, 0, true, 1, true)
}

export function isValidPan(value: number) {
    return isInRange(value, -1.0, true, 1.0, true)
}
