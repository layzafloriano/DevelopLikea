const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  imagePath: String,
  imageName: String,
},
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
