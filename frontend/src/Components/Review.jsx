import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

const ReviewSection = () => {
  const { docId } = useParams();
  const { userData, backendUrl, token, doctors } = useContext(AppContext);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [docInfo, setDocInfo] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Fetch doctor info based on docId
  useEffect(() => {
    const info = doctors.find((doc) => doc._id === docId);
    setDocInfo(info);
  }, [doctors, docId]);

  // Fetch all reviews for this doctor
  const getAllReviews = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/all-review/${docId}`);
      if (data.success) {
        setReviews(data.review);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Error fetching reviews');
    }
  };

  useEffect(() => {
    getAllReviews();
  }, [docId]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) return toast.warn('Please select a rating');

    try {
      const res = await axios.post(
        `${backendUrl}/api/user/review`,
        {
          userId: userData._id,
          rating,
          feedback,
          docId,
        },
        {
          headers: { token },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setRating(0);
        setFeedback('');
        getAllReviews();
      } else {
        toast.error('Failed to submit review');
      }
    } catch (err) {
      toast.error('An error occurred while submitting review');
    }
  };

  return (
    <div className="m-5 p-6 bg-blue-100 w-full rounded shadow-md mx-auto">
      {docInfo && (
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-semibold text-indigo-800">
            Review Dr. {docInfo.name}
          </h2>
          <p className="text-gray-600">{docInfo.specialty}</p>
        </div>
      )}

      <h3 className="text-xl mb-4 font-medium text-center">Give Rating and Feedback</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Star Rating */}
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`text-4xl cursor-pointer ${
                star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              aria-label={`Rate ${star} stars`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Feedback Textarea */}
        <textarea
          className="p-3 rounded border border-gray-300 resize-none"
          rows={4}
          placeholder="Write your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-500 transition-colors"
        >
          Submit Review
        </button>
      </form>

    <div className="bg-white mt-6 p-4 rounded shadow-sm">
  <h4 className="text-lg font-semibold mb-3">All Reviews</h4>
  {Array.isArray(reviews) && reviews.length > 0 ? (
    [...Array(Math.ceil(reviews.length / 2))].map((_, rowIndex) => {
      const start = rowIndex * 2;
      const rowItems = reviews
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(start, start + 2);
      return (
        <div key={rowIndex} className="flex gap-4 mb-4">
          {rowItems.map((item) => (
            <div key={item._id} className="flex-1  p-3 bg-blue-50 rounded shadow">
              <p className="font-semibold">{item.username}</p>
              <p className="text-yellow-500">Rating: {item.rating} ★</p>
              <p>{item.feedback}</p>
              <p className="text-sm text-gray-500">
                {new Date(item.date).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      );
    })
  ) : (
    <p className="text-gray-500">No reviews yet.</p>
  )}
</div>

    </div>
  );
};

export default ReviewSection;
