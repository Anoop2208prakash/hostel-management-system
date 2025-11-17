import asyncHandler from 'express-async-handler';
import type { Response } from 'express';
import prisma from '../../lib/prisma';
import type { AuthRequest } from '../auth/auth.middleware';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Token generation helper
const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not defined');
  }
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401);
    throw new Error('User not found');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true, role: true },
  });

  res.json(user);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { name, email, phone, password } = req.body;

  if (!userId) {
    res.status(401);
    throw new Error('User not found');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if email is taken by another user
  if (email && email !== user.email) {
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }

  // Hash new password if provided
  let hashedPassword = user.password;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      password: hashedPassword,
    },
  });

  // Return updated user info with a new token
  res.json({
    _id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    role: updatedUser.role,
    token: generateToken(updatedUser.id),
  });
});

/**
 * @desc    Get user addresses
 * @route   GET /api/users/addresses
 * @access  Private
 */
export const getAddresses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401);
    throw new Error('User not found');
  }

  const addresses = await prisma.address.findMany({
    where: { userId },
  });

  res.json(addresses);
});

/**
 * @desc    Add a new address
 * @route   POST /api/users/addresses
 * @access  Private
 */
export const addAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { street, city, zip } = req.body;

  if (!userId) {
    res.status(401);
    throw new Error('User not found');
  }

  if (!street || !city || !zip) {
    res.status(400);
    throw new Error('Please provide street, city, and zip code');
  }

  const address = await prisma.address.create({
    data: {
      userId,
      street,
      city,
      zip,
    },
  });

  res.status(201).json(address);
});