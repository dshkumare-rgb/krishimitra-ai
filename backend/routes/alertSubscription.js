import express from 'express';
import { getSubscription, updateSubscription } from '../controllers/alertSubscriptionController.js';

const router = express.Router();

router.get('/subscription', getSubscription);
router.post('/subscription', updateSubscription);

export default router;
