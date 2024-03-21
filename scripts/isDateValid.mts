export const isDateValid = (date: string | undefined): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!date) {
      return resolve(false);
    }
    if (date.length === 0) {
      return true; // use today's date
    }
    return /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)Z$/.test(
      date,
    )
      ? resolve(true)
      : resolve(false);
  });
};
