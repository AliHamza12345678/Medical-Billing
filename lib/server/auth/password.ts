import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (
    !password ||
    typeof password !== 'string' ||
    password.length === 0 ||
    !hash ||
    typeof hash !== 'string' ||
    hash.trim() === ''
  ) {
    return false;
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    return false;
  }
}

