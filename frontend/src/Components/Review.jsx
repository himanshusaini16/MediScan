import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext'; // adjust path if needed
import { toast } from 'react-toastify';
import { data } from 'react-router-dom';

const ReviewSection = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const { userData,backendUrl} = useContext(AppContext); 

  {
    console.log("user Data",userData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(backendUrl+'/api/user/review', {
        userId: userData._id,
        rating,
        feedback
      });


      

      if (res.data.success) {
        toast.success(res.data.message)
        setRating(0);
        setFeedback('');
      } else {
        alert('Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while submitting review');
    }
  };

  return (
    <div className="m-5 p-4 bg-blue-50 w-full">
      <h2 className="text-2xl mb-4 text-center font-medium">Give Rating And Feedback</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        <textarea
          className="p-2 rounded border border-gray-300 resize-none"
          rows={4}
          placeholder="Write your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}

        />

        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-500 transition-colors"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default ReviewSection;
