import express from 'express';
import { getListings, createListing, markAsSold } from '../controllers/marketplaceController.js';

const router = express.Router();

router.get('/listings', getListings);
router.post('/listings', createListing);
router.patch('/listings/:id/sold', markAsSold);

export default router;
