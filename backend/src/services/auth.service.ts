import * as usersRepo from '../repositories/users.repository.js';
import * as professionalsRepo from '../repositories/professionals.repository.js';
import { comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, TokenPayload } from '../utils/token.js';
import { AppError } from '../middlewares/errorHandler.js';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    locationId: number | null;
    professionalId: number | null;
  };
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const user = await usersRepo.findByUsername(username);
  if (!user) {
    throw new AppError(401, 'Invalid username or password');
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw new AppError(401, 'Invalid username or password');
  }

  const publicUser = await usersRepo.findById(user.id);
  if (!publicUser) throw new AppError(500, 'Error retrieving user data');

  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    role: publicUser.role_code,
    locationId: user.location_id,
  };

  let professionalId: number | null = null;
  if (publicUser.role_code === 'PROFESSIONAL') {
    const prof = await professionalsRepo.findByUserId(user.id);
    professionalId = prof?.id ?? null;
  }

  await usersRepo.updateLastAccess(user.id);

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      role: publicUser.role_code,
      locationId: user.location_id,
      professionalId,
    },
  };
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const newPayload: TokenPayload = {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      locationId: payload.locationId,
    };
    return {
      accessToken: signAccessToken(newPayload),
      refreshToken: signRefreshToken(newPayload),
    };
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token');
  }
}
