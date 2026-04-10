export const extractKeys = <T extends number | string>(
	enumRecord: Record<T, unknown>,
) => Object.keys(enumRecord).map((key) => Number(key) as unknown as T);
