const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: true,
    unique: true
  },
  destination: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['ON_TIME', 'DELAYED', 'CANCELLED'],
    default: 'ON_TIME'
  },
  scheduledDeparture: {
    type: Date,
    required: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Flight', flightSchema); 