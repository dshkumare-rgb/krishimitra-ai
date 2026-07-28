import AlertSubscription from '../models/AlertSubscription.js';
import SubscribedAlertLog from '../models/SubscribedAlertLog.js';
import PestAlert from '../models/PestAlert.js';
import MandiPrice from '../models/MandiPrice.js';
import { db } from '../config/db.js';
import { sendNotification } from '../config/notification.js';
import axios from 'axios';

// Local cache to prevent double sending the same alert in a single session
const sentAlertsCache = new Set();

export const runAlertScanner = async () => {
  console.log('⏰ Running scheduled WhatsApp/SMS alert matching scanner...');

  try {
    const subscribers = await db.find(AlertSubscription, {});
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const sub of subscribers) {
      // 1. Rate Limiting Check (Max 3 messages per user per 24 hours)
      const logs = await db.find(SubscribedAlertLog, { 
        userFirebaseId: sub.userFirebaseId 
      });
      const recentLogs = logs.filter(log => new Date(log.timestamp) > oneDayAgo);

      if (recentLogs.length >= 3) {
        console.log(`[Rate Limit] Subscriber ${sub.phone} has reached the 24h limit of 3 alerts. Skipping.`);
        continue;
      }

      // 2. Pest Alert Check
      if (sub.alertPest) {
        const activePests = await db.find(PestAlert, { 
          district: sub.district, 
          status: 'Active' 
        });

        for (const pest of activePests) {
          const cacheKey = `pest-${sub.userFirebaseId}-${pest._id}`;
          if (sentAlertsCache.has(cacheKey)) continue;

          const msg = `⚠️ KrishiMitra Alert: Active ${pest.pestName} outbreak detected in ${pest.district}. Severity: ${pest.severity}. Action Required: ${pest.recommendedAction}. Details: http://localhost:3000/`;
          
          await sendNotification(sub.phone, msg);
          
          const log = new SubscribedAlertLog({ userFirebaseId: sub.userFirebaseId, alertType: 'pest' });
          await db.save(log);
          sentAlertsCache.add(cacheKey);
          break; // Send at most one alert per scanner loop iteration to respect throttle limits
        }
      }

      // 3. Weather Warning Check
      if (sub.alertWeather) {
        // Query Open-Meteo forecast for coordinates associated with user's district
        // We'll generate district-based coordinates (Indore standard fallback coordinate offsets)
        let hash = 0;
        const key = `${sub.district}, ${sub.state}`;
        for (let i = 0; i < key.length; i++) {
          hash = key.charCodeAt(i) + ((hash << 5) - hash);
        }
        const lat = 15.0 + Math.abs((hash % 150) / 10);
        const lon = 73.0 + Math.abs(((hash >> 8) % 120) / 10);

        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation&timezone=auto`;
          const response = await axios.get(url);
          const currentPrecip = response.data.current.precipitation || 0;

          if (currentPrecip > 15) { // 15mm heavy rain warning trigger
            const cacheKey = `weather-${sub.userFirebaseId}-${now.toDateString()}`;
            if (!sentAlertsCache.has(cacheKey)) {
              const msg = `🌧️ KrishiMitra Weather Alert: Heavy rain (${currentPrecip}mm) detected in your district ${sub.district}. Postpone fertilizer spraying and clear drainage routes. Details: http://localhost:3000/`;
              
              await sendNotification(sub.phone, msg);
              
              const log = new SubscribedAlertLog({ userFirebaseId: sub.userFirebaseId, alertType: 'weather' });
              await db.save(log);
              sentAlertsCache.add(cacheKey);
            }
          }
        } catch (e) {
          console.error(`Failed to fetch weather warning for ${sub.district}:`, e.message);
        }
      }
    }
  } catch (err) {
    console.error('❌ Scheduler scanner failed during scanning check:', err.message);
  }
};

// Start background interval cycle (run scanner every 60 seconds)
export const initCronJob = () => {
  setInterval(runAlertScanner, 60000);
  console.log('🗓️ Alert CronJob initialized to scan every 60 seconds.');
};
