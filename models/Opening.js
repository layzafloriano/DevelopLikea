const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const openingSchema = new Schema({
  title: String,
  description: String,
  company: String,
  salary: String,
  requirements: String,
  author: [{ type: Schema.Types.ObjectId, ref: 'Author' }],
  location: { type: { type: String }, coordinates: [Number] },
  type: {
    type: String,
    enum: ['CLT', 'PJ'],
  },
  level: {
    type: String,
    enum: ['internship', 'junior', 'intermediate', 'senior'],
  },
  city: String,
  link: String,
}, {
  timestamps: true,
});

openingSchema.index({ location: '2dsphere' });

const Opening = mongoose.model('Opening', openingSchema);

module.exports = Opening;
