import express from 'express';
import { getPrices, getNearestMandis, getPriceDetails } from '../controllers/mandiController.js';

const router = express.Router();

router.get('/prices', getPrices);
router.get('/nearest', getNearestMandis);
router.get('/details/:id', getPriceDetails);

export default router;
