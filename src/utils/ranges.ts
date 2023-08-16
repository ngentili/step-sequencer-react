export function isInRange(value: number,
    min: number, inclusiveMin: boolean,
    max: number, inclusiveMax: boolean) {

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
