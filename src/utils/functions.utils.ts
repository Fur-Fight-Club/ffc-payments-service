import { uuid } from "uuidv4";

export const generateUUID = () => {
  return uuid();
};

export const addDotEveryThreeChars = (str: string) => {
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
