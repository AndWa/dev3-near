export const generateKey = async (
  size = 32,
  format: BufferEncoding = 'base64',
) => {
  const { randomBytes } = await import('crypto');
  const buffer = randomBytes(size);
  return buffer.toString(format);
};

export const generateSecretHash = async (key: string) => {
  const { randomBytes, scryptSync } = await import('crypto');
  const salt = randomBytes(8).toString('hex');
  const buffer = scryptSync(key, salt, 64) as Buffer;
  return `${buffer.toString('hex')}.${salt}`;
};

export const compareKeys = async (storedKey: string, suppliedKey: string) => {
  const { timingSafeEqual, scryptSync } = await import('crypto');
  const [hashedPassword, salt] = storedKey.split('.');

  const buffer = scryptSync(suppliedKey, salt, 64) as Buffer;
  return timingSafeEqual(Buffer.from(hashedPassword, 'hex'), buffer);
};
