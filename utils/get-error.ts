export const getFirstError = (errors: any): string | null => {
  const errorKeys = Object.keys(errors);
  if (errorKeys.length > 0) {
    const firstKey = errorKeys[0];
    return errors[firstKey]?.message || null;
  }
  return null;
};
