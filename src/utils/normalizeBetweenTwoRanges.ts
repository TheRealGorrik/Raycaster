
export const normalizeBetweenTwoRanges = (
    val: number,
    minVal: number,
    maxVal: number,
    newMin: number,
    newMax: number): number => {
    return newMin + (val - minVal) * (newMax - newMin) / (maxVal - minVal);
};
