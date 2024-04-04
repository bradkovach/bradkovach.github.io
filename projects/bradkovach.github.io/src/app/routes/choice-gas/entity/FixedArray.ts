/**
 * A fixed-length array type.
 * @param T The type of the array elements.
 * @param L The length of the array.
 *
 * @example
 * const usage: FixedArray<number, 12> = [ 1,2,3,4,5,6,7,8,9,10,11,12 ];
 */
export type FixedArray<T, L extends number> = T[] & { length: L };
