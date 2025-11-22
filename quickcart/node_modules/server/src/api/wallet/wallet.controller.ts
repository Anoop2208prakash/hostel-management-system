import asyncHandler from 'express-async-handler';
import type { Response } from 'express';
import prisma from '../../lib/prisma';
import type { AuthRequest } from '../auth/auth.middleware';

/**
 * @desc    Get wallet balance and transaction history
 * @route   GET /api/wallet
 * @access  Private
 */
export const getWallet = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new Error('User not found');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      walletBalance: true,
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 20 // Last 20 transactions
      }
    }
  });

  res.json(user);
});

/**
 * @desc    Add money to wallet (Mock Payment)
 * @route   POST /api/wallet/add
 * @access  Private
 */
export const addMoney = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid amount');
  }

  if (!userId) throw new Error('User not found');

  // Use transaction to ensure balance and history update together
  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Balance
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { 
        walletBalance: { increment: parseFloat(amount) } 
      },
      select: { walletBalance: true }
    });

    // 2. Create Transaction Record
    await tx.walletTransaction.create({
      data: {
        userId,
        amount: parseFloat(amount),
        type: 'CREDIT',
        description: 'Added money to wallet'
      }
    });

    return updatedUser;
  });

  res.json(result);
});