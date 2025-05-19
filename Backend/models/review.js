import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);


export default Review;

