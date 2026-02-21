import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { config } from '../lib/config.js';
import { AppError } from '../middleware/error.js';
import type { RegisterInput, LoginInput } from '@lpf/shared';

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });

  return user;
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN as string & jwt.SignOptions['expiresIn'] },
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
}
