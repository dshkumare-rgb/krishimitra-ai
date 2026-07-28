import express from 'express';
import { getStats, createScheme, getSchemes, deleteScheme, addMandiPrice, deleteMandiPrice } from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', getStats);
router.post('/schemes', createScheme);
router.get('/schemes', getSchemes);
router.delete('/schemes/:id', deleteScheme);
router.post('/mandi', addMandiPrice);
router.delete('/mandi/:id', deleteMandiPrice);

export default router;
