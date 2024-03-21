export const negatePromise = (promise: Promise<boolean>): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    return promise.then((theBoolean) => !theBoolean).catch(reject);
  });
};
