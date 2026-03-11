import { describe, it, expect, vi } from 'vitest';
import type { Profile } from 'passport-google-oauth20';
import { createGoogleVerifyCallback } from './googleVerifyCallback.js';

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: '12345',
    displayName: 'Test User',
    emails: [{ value: 'tu123@cam.ac.uk', verified: true }],
    provider: 'google',
    profileUrl: '',
    _raw: '',
    _json: { iss: '', aud: '', sub: '12345', iat: 0, exp: 0 },
    ...overrides,
  };
}

describe('createGoogleVerifyCallback', () => {
  it('calls upsert with profile data and passes user to done', async () => {
    const fakeUser = { id: '12345', displayName: 'Test User', email: 'tu123@cam.ac.uk' };
    const mockService = { upsert: vi.fn().mockResolvedValue([fakeUser, true]) };
    const done = vi.fn();

    const callback = createGoogleVerifyCallback(mockService);
    await callback('access', 'refresh', makeProfile(), done);

    expect(mockService.upsert).toHaveBeenCalledWith({
      id: '12345',
      displayName: 'Test User',
      email: 'tu123@cam.ac.uk',
    });
    expect(done).toHaveBeenCalledWith(null, fakeUser);
  });

  it('calls upsert for existing users (upsert is idempotent)', async () => {
    const existingUser = { id: '12345', displayName: 'Test User', email: 'tu123@cam.ac.uk' };
    const mockService = { upsert: vi.fn().mockResolvedValue([existingUser, false]) };
    const done = vi.fn();

    const callback = createGoogleVerifyCallback(mockService);
    await callback('access', 'refresh', makeProfile(), done);

    expect(mockService.upsert).toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith(null, existingUser);
  });

  it('passes empty string for email when profile has no emails', async () => {
    const fakeUser = { id: '12345', displayName: 'Test User', email: '' };
    const mockService = { upsert: vi.fn().mockResolvedValue([fakeUser, true]) };
    const done = vi.fn();

    const callback = createGoogleVerifyCallback(mockService);
    await callback('access', 'refresh', makeProfile({ emails: undefined }), done);

    expect(mockService.upsert).toHaveBeenCalledWith({
      id: '12345',
      displayName: 'Test User',
      email: '',
    });
    expect(done).toHaveBeenCalledWith(null, fakeUser);
  });

  it('passes error to done when upsert throws', async () => {
    const error = new Error('DB connection failed');
    const mockService = { upsert: vi.fn().mockRejectedValue(error) };
    const done = vi.fn();

    const callback = createGoogleVerifyCallback(mockService);
    await callback('access', 'refresh', makeProfile(), done);

    expect(done).toHaveBeenCalledWith(error);
  });
});
