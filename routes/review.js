const express = require('express');
const router = express.Router({mergeParams: true});
const Listing = require("../models/listing.js");
const wrapAsync =require("../utils/wrapAsync.js");
const ExpressError =require("../utils/ExpressError.js");
const Review = require("../models/review.js");// wee keep here .. bcz we are going to parent file
const {validateReview, 
  isLoggedIn, 
  isReviewAuthor} =
 require("../expressMiddleware.js");

//controller require
const reviewController = require("../controllers/reviews.js");
const review = require("../models/review.js");

 
//review route - post route validateReview is added as middleware
router.post(
  "/",           // <— plural
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview
));



//review route - delete route
router.delete(
  "/:reviewId", // <— plural
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;