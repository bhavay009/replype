const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Protect all review routes
router.use(auth);

// @route   GET api/reviews
// @route   POST api/reviews
router.route('/')
  .get(reviewController.getReviews)
  .post(reviewController.addReview);

// @route   GET api/reviews/stats
router.get('/stats', reviewController.getStats);

module.exports = router;
