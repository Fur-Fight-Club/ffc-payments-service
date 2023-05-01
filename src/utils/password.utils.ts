import * as bcrypt from 'bcrypt';

const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
}

const comparePassword = async (password: string, hashPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
}

export const password = {
  hash: hashPassword,
  verify: comparePassword
}