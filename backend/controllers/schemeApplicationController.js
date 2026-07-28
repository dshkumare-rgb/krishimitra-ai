import SchemeApplication from '../models/SchemeApplication.js';
import { db } from '../config/db.js';

export const getApplications = async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const list = await db.find(SchemeApplication, { userFirebaseId: userId });
    res.status(200).json(list);
  } catch (err) {
    console.error('Failed to retrieve scheme applications:', err.message);
    res.status(500).json({ error: 'Failed to retrieve application logs.' });
  }
};

export const logApplication = async (req, res) => {
  const { userId, schemeId, schemeName, status, checklist, notes, followUpDate } = req.body;

  if (!userId || !schemeId || !schemeName) {
    return res.status(400).json({ error: 'User ID, schemeId, and schemeName are required.' });
  }

  try {
    const app = new SchemeApplication({
      userFirebaseId: userId,
      schemeId,
      schemeName,
      status: status || 'Submitted',
      documentChecklist: checklist || [],
      notes,
      followUpReminderDate: followUpDate ? new Date(followUpDate) : null
    });

    await db.save(app);
    res.status(201).json({ message: 'Scheme application logged successfully.', application: app });
  } catch (err) {
    console.error('Failed to log scheme application:', err.message);
    res.status(500).json({ error: 'Failed to save application log.' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const apps = await db.find(SchemeApplication, { _id: id });
    if (apps.length === 0) {
      return res.status(404).json({ error: 'Application log not found.' });
    }

    const app = apps[0];
    if (status) app.status = status;
    if (notes) app.notes = notes;

    await db.save(app);
    res.status(200).json({ message: 'Application status updated successfully.', application: app });
  } catch (err) {
    console.error('Failed to update application status:', err.message);
    res.status(500).json({ error: 'Failed to update application.' });
  }
};
