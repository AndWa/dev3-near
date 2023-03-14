export const isValidEnum = (enumType: any, value: string) => {
  return (Object.values(enumType) as string[]).includes(value);
};
