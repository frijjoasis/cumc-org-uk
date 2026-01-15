import crypto from 'crypto';

const FILENAME_SALT = 'cumc-silly-salt-for-img-id-hiding';

export const getHashedFilename = (id: number, type: 'profile' | 'cover') => {
  return crypto
    .createHash('sha256')
    .update(`${FILENAME_SALT}-${id}-${type}`)
    .digest('hex')
    .substring(0, 16);
};
