export const isCategoryValid = (
  category: string[] | undefined,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!category) {
      return resolve(false);
    }
    resolve(true);
  });
};
