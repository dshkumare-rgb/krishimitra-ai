import express from 'express';
import { getPestAlerts, reportPest, triggerSMSAlert } from '../controllers/alertController.js';

const router = express.Router();

router.get('/pest', getPestAlerts);
router.post('/pest/report', reportPest);
router.post('/sms/trigger', triggerSMSAlert);

export default router;
