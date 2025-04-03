export const getEnvAsync = (key: string): Promise<string> =>
	new Promise((resolve, reject) => {
		const value = process.env[key];
		if (value) {
			resolve(value);
		} else {
			reject(new Error(`Environment variable ${key} not set`));
		}
	});
