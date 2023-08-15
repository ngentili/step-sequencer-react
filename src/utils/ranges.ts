export enum RangeEndType {
    Inclusive,
    Exclusive,
}

export function isInRange(value: number,
    min: number, minType: RangeEndType,
    max: number, maxType: RangeEndType) {

    if (minType == RangeEndType.Inclusive) {
        if (value <= min) {
            return false
        }
    }
    else {
        if (value < min) {
            return false
        }
    }

    if (maxType == RangeEndType.Inclusive) {
        if (value >= max) {
            return false
        }
    }
    else {
        if (value > max) {
            return false
        }
    }

    return true
}
