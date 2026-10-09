const express = require('express');
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
//const ExpressError = require("../utils/ExpressError.js");
//const { listingSchema } = require("../schema.js");
const {isLoggedIn, isOwner,validateListing}= require("../expressMiddleware.js");
//controllers required 
const listingController = require("../controllers/listings.js");
//multer  and upload
const multer  = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({storage});


//router.route
router
.route("/")
.get( wrapAsync(listingController.index))//index route
.post(
  isLoggedIn, 
  upload.single('listing[image]'),
  validateListing,
   wrapAsync(listingController.createListing))//create route 

// New route
router.get("/new",isLoggedIn,listingController.renderNewForm );

router
.route("/:id")
.get( wrapAsync(listingController.showListing))//show route
.put( isLoggedIn,
  isOwner,
   upload.single('listing[image]'),
  validateListing, 
  wrapAsync(listingController.updateListing))//update route
.delete(isLoggedIn,
  isOwner, wrapAsync(listingController.deleteListing));//delete route

// Edit route
router.get("/:id/edit", isLoggedIn, 
  isOwner, 
  wrapAsync(listingController.editListing));


module.exports = router;
