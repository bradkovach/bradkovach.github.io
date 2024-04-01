export const isTitleValid = (title: string | undefined): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		if (!title) {
			return resolve(false);
		}
		return title.length > 0 ? resolve(true) : resolve(false);
	});
};
