const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true },
);

module.exports = mongoose.model('Ticket', TicketSchema);
