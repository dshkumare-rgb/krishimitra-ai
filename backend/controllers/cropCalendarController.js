import CropCalendarRecord from '../models/CropCalendarRecord.js';
import { db } from '../config/db.js';

export const getRecords = async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const list = await db.find(CropCalendarRecord, { userFirebaseId: userId });
    res.status(200).json(list);
  } catch (err) {
    console.error('Failed to retrieve sowing records:', err.message);
    res.status(500).json({ error: 'Failed to retrieve sowing records.' });
  }
};

export const saveRecord = async (req, res) => {
  const { userId, cropName, sowingDate } = req.body;
  if (!userId || !cropName || !sowingDate) {
    return res.status(400).json({ error: 'User ID, cropName, and sowingDate are required.' });
  }

  try {
    // Check if record already exists for this crop and user
    let records = await db.find(CropCalendarRecord, { userFirebaseId: userId, cropName });
    let record;

    if (records.length > 0) {
      record = records[0];
      record.sowingDate = new Date(sowingDate);
    } else {
      record = new CropCalendarRecord({
        userFirebaseId: userId,
        cropName,
        sowingDate: new Date(sowingDate)
      });
    }

    await db.save(record);
    res.status(200).json({ message: 'Sowing record saved successfully.', record });
  } catch (err) {
    console.error('Failed to save sowing record:', err.message);
    res.status(500).json({ error: 'Failed to save sowing record.' });
  }
};

export const deleteRecord = async (req, res) => {
  const { id } = req.params;
  try {
    await db.delete(CropCalendarRecord, { _id: id });
    res.status(200).json({ message: 'Sowing record deleted successfully.' });
  } catch (err) {
    console.error('Failed to delete sowing record:', err.message);
    res.status(500).json({ error: 'Failed to delete sowing record.' });
  }
};
