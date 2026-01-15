import crypto from 'crypto';

const FILENAME_SALT = 'cumc-silly-salt-for-img-id-hiding';

export const getHashedFilename = (
  id: number | string, // Id must be string due to rounding issues (16 digit numbers or greater get rounded)
  type: 'profile' | 'cover'
) => {
  return crypto
    .createHash('sha256')
    .update(`${FILENAME_SALT}-${id}-${type}`)
    .digest('hex')
    .substring(0, 16);
};
