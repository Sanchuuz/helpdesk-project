const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Completed'],
    default: 'New',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ticket', TicketSchema);
