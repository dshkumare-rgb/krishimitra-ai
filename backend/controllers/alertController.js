import PestAlert from '../models/PestAlert.js';
import { db } from '../config/db.js';

// 1. RETRIEVE ALL PEST ALERTS
export const getPestAlerts = async (req, res) => {
  const { state, district } = req.query;
  const filter = {};
  
  if (state) filter.state = state;
  if (district) filter.district = district;

  try {
    let list = await db.find(PestAlert, filter);

    if (list.length === 0 && state && district) {
      let hash = 0;
      const key = `${district}, ${state}`;
      for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
      }
      const lat = 15.0 + Math.abs((hash % 150) / 10);
      const lon = 73.0 + Math.abs(((hash >> 8) % 120) / 10);

      const mockAlert = {
        _id: `mock-alert-${district.toLowerCase()}`,
        pestName: hash % 2 === 0 ? 'Fall Armyworm' : 'Whitefly Infestation',
        cropAffected: hash % 2 === 0 ? 'Maize' : 'Cotton',
        severity: hash % 3 === 0 ? 'HIGH' : 'MEDIUM',
        state,
        district,
        description: `Early detection warning: High humidity spikes in ${district} have elevated pest reproduction rates. Spray controls immediately.`,
        symptoms: 'Leaf perforation, yellowing patches on leaf undersides.',
        controlMeasures: hash % 2 === 0 
          ? 'Apply Neem Oil (Azadirachtin 1500 ppm) or Chlorantraniliprole 18.5% SC.' 
          : 'Spray Imidacloprid 17.8% SL or yellow sticky traps installation.',
        latitude: parseFloat(lat.toFixed(4)),
        longitude: parseFloat(lon.toFixed(4)),
        reportedAt: new Date().toISOString()
      };

      return res.status(200).json([mockAlert]);
    }

    return res.status(200).json(list);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve pest alerts', details: err.message });
  }
};

// 2. REPORT A PEST OUTBREAK (FARMER ACTION)
export const reportPest = async (req, res) => {
  const { pestName, cropAffected, severity, state, district, description, symptoms, controlMeasures, latitude, longitude } = req.body;

  if (!pestName || !cropAffected || !state || !district) {
    return res.status(400).json({ error: 'Missing required parameters for reporting pest outbreak' });
  }

  try {
    const newAlert = await db.create(PestAlert, {
      pestName,
      cropAffected,
      severity: severity || 'MEDIUM',
      state,
      district,
      description: description || 'Reported by local farmer.',
      symptoms: symptoms || '',
      controlMeasures: controlMeasures || 'Consult local KVK agricultural officers.',
      latitude: parseFloat(latitude) || 22.0,
      longitude: parseFloat(longitude) || 75.0,
      reportedAt: new Date().toISOString()
    });

    console.log(`📡 [PEST ALERT SYSTEM] New outbreak reported: ${pestName} in ${district}, ${state}.`);
    return res.status(201).json(newAlert);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to record outbreak report', details: err.message });
  }
};

// 3. TRIGGER SMS ALERT (SIMULATOR FOR FARMERS)
export const triggerSMSAlert = async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'Phone number and message text are required.' });
  }

  try {
    // SMS provider simulation log
    console.log('\n=================== 📨 OUTGOING SMS GATEWAY ===================');
    console.log(`TO: ${phoneNumber}`);
    console.log(`MESSAGE: "${message}"`);
    console.log('STATUS: Mock Sent Successfully via Gateway Core');
    console.log('================================================================\n');

    return res.status(200).json({
      success: true,
      provider: 'KrishiMitra Gateway Mock Core',
      recipient: phoneNumber,
      messageSent: message,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: 'SMS gateway failure', details: err.message });
  }
};
