const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  githubId: String,
  name: String,
  username: {
    type: String,
    unique: true,
    // required: true
  },
  password: {
    type: String,
    // required: true,
  },
  status: {
    type: String,
    enum: ['Pending Confirmation', 'Active']
  },
  confirmationCode: {
    type: String,
    unique: true,
    // required: true,
  },
  email: {
    type: String,
    // required: true,
    unique: true,
  },
  mentor: Boolean,
  openToOpportunities: Boolean,
  city: String,
  specialty: {
    type: String,
    enum: ['FrontEnd', 'BackEnd', 'FullStack', 'Student', 'Other'],
  },
  bio: String,
  number: String,
  imageName: String,
  imagePath: {
    type: String,
    default: '../image/no-user-image.png',
  }
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;
