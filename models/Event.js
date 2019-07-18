const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const eventSchema = new Schema({
  title: String,
  date: String,
  time: String,
  authorID: String,
  location: { type: { type: String }, coordinates: [Number] },
  city: String,
  description: String,
  price: String,
  imageName: String,
  imagePath: String,
},
{
  timestamps: true,
});

eventSchema.index({ location: '2dsphere' });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
