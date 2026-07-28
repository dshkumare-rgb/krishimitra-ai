import AlertSubscription from '../models/AlertSubscription.js';
import { db } from '../config/db.js';

export const getSubscription = async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const list = await db.find(AlertSubscription, { userFirebaseId: userId });
    if (list.length === 0) {
      return res.status(200).json(null);
    }
    res.status(200).json(list[0]);
  } catch (err) {
    console.error('Failed to get subscription:', err.message);
    res.status(500).json({ error: 'Failed to retrieve alert configurations.' });
  }
};

export const updateSubscription = async (req, res) => {
  const { userId, phone, state, district, alertPest, alertWeather, alertMandi, alertMandiThreshold, alertSchemes } = req.body;

  if (!userId || !phone || !state || !district) {
    return res.status(400).json({ error: 'User ID, phone number, and location state/district are required.' });
  }

  try {
    let list = await db.find(AlertSubscription, { userFirebaseId: userId });
    let sub;

    if (list.length > 0) {
      sub = list[0];
      sub.phone = phone;
      sub.state = state;
      sub.district = district;
      if (alertPest !== undefined) sub.alertPest = alertPest;
      if (alertWeather !== undefined) sub.alertWeather = alertWeather;
      if (alertMandi !== undefined) sub.alertMandi = alertMandi;
      if (alertMandiThreshold !== undefined) sub.alertMandiThreshold = alertMandiThreshold;
      if (alertSchemes !== undefined) sub.alertSchemes = alertSchemes;
    } else {
      sub = new AlertSubscription({
        userFirebaseId: userId,
        phone,
        state,
        district,
        alertPest: alertPest !== undefined ? alertPest : true,
        alertWeather: alertWeather !== undefined ? alertWeather : true,
        alertMandi: alertMandi !== undefined ? alertMandi : true,
        alertMandiThreshold: alertMandiThreshold !== undefined ? alertMandiThreshold : 10,
        alertSchemes: alertSchemes !== undefined ? alertSchemes : true
      });
    }

    await db.save(sub);
    res.status(200).json({ message: 'Alert subscription preferences saved successfully.', subscription: sub });
  } catch (err) {
    console.error('Failed to save subscription:', err.message);
    res.status(500).json({ error: 'Failed to save alert preferences.' });
  }
};
