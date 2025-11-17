import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getAddresses, // <-- 1. Import address functions
  addAddress,   // <-- 1. Import address functions
} from './user.controller';
import { protect } from '../auth/auth.middleware';

const router = express.Router();

// All routes here are protected
router.use(protect);

// User Profile Routes
router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

// --- 2. Add Address Routes ---
router.route('/addresses')
  .get(getAddresses)
  .post(addAddress);

export default router;