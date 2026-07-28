import express from 'express';
import { createCallbackRequest } from '../controllers/supportController.js';

const router = express.Router();

router.post('/callback', createCallbackRequest);

export default router;
