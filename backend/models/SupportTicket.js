import mongoose from 'mongoose';

const SupportTicketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  description: { type: String, required: true },
  attachedImage: String, // Leaf scan URL link if applicable
  sourcePage: { type: String, default: 'dashboard' },
  status: { type: String, enum: ['Open', 'Assigned', 'Resolved'], default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('SupportTicket', SupportTicketSchema);
