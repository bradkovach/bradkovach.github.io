export const isTagValid = (tag: string[] | undefined): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!tag) {
      return resolve(false);
    }
    resolve(true);
  });
};
