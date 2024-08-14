const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  visitDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Visitor', visitorSchema);
