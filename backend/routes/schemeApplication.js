import express from 'express';
import { getApplications, logApplication, updateApplicationStatus } from '../controllers/schemeApplicationController.js';

const router = express.Router();

router.get('/applications', getApplications);
router.post('/applications', logApplication);
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;
