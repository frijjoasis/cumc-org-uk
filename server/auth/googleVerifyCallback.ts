import type { Profile, VerifyCallback } from 'passport-google-oauth20';

interface UpsertService {
  upsert(data: { id: string; displayName: string; email: string }): Promise<[any, boolean | null]>;
}

export function createGoogleVerifyCallback(userService: UpsertService) {
  return async (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => {
    try {
      const userData = {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value || '',
      };

      const [user] = await userService.upsert(userData);
      return done(null, user as any);
    } catch (err) {
      return done(err as Error);
    }
  };
}
