import express from 'express';
import multer from 'multer';
import { recommendCrops, detectDisease, planIrrigation, recommendFertilizers } from '../controllers/aiController.js';

const router = express.Router();

// Configure multer to store uploaded files in memory buffers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post('/crop-recommendation', recommendCrops);
router.post('/disease-detection', upload.single('image'), detectDisease);
router.post('/irrigation-planner', planIrrigation);
router.post('/fertilizer-recommendation', recommendFertilizers);

export default router;
