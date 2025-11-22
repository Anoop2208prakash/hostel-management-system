import express from 'express';
import { getWallet, addMoney } from './wallet.controller';
import { protect } from '../auth/auth.middleware';

const router = express.Router();

router.use(protect); // All wallet routes are protected

router.route('/')
  .get(getWallet);

router.route('/add')
  .post(addMoney);

export default router;