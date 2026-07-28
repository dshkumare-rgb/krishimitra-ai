import SupportTicket from '../models/SupportTicket.js';
import { db } from '../config/db.js';

export const createCallbackRequest = async (req, res) => {
  const { name, phone, description, attachedImage, sourcePage } = req.body;
  
  if (!name || !phone || !description) {
    return res.status(400).json({ error: 'Name, phone, and description are required.' });
  }

  try {
    const ticket = new SupportTicket({
      name,
      phone,
      description,
      attachedImage,
      sourcePage
    });

    await db.save(ticket);
    console.log('📞 Helpline Callback Ticket logged:', ticket);

    res.status(201).json({
      message: 'Support ticket callback registered successfully.',
      ticket
    });
  } catch (err) {
    console.error('Failed to save support ticket callback:', err.message);
    res.status(500).json({ error: 'Failed to submit callback request. Please try again.' });
  }
};
