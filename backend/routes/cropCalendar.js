import express from 'express';
import { getRecords, saveRecord, deleteRecord } from '../controllers/cropCalendarController.js';

const router = express.Router();

router.get('/records', getRecords);
router.post('/records', saveRecord);
router.delete('/records/:id', deleteRecord);

export default router;
