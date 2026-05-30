//in this we will store callbacks form the routes
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken =  process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });


//index route controller
module.exports.index = async (req, res) => {
  const { category } = req.query;
  let allListings;
  if (category) {
    allListings = await Listing.find({ category: category });
  } else {
    allListings = await Listing.find({});
  }
  res.render("listings/index.ejs", { 
    allListings, 
    mapToken: process.env.MAP_TOKEN,
    activeCategory: category
  });
};


//new route
module.exports.renderNewForm = async(req, res) => {
  console.log(req.user);
  
  res.render("listings/new.ejs");
};

//show route controller
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({path: "reviews",
    populate :{
      path : "author",//to print author name for their review
    }
  }).populate("owner");
  if (!listing) {
    req.flash("error", "Listing you are requesting for does not exist");
    return res.redirect("/listings"); // ✅ added return
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

//create route
module.exports.createListing = async (req, res, next) => {
 let response = await geoCodingClient
 .forwardGeocode({
  query: req.body.listing.location ,
  limit: 1,
})
  .send();

  //(response.body.features[0].geometry);//as feature is array we are willing to access geometry
  //res.send("done!");
  
  let url = req.file.path;
  let filename =  req.file.filename;
const newListing = new Listing(req.body.listing);
// console.log(newListing);
newListing.owner = req.user._id;
newListing.image = {url , filename};
//mapp 
newListing.geometry = response.body.features[0].geometry;

let savedListing =  await newListing.save();
console.log(savedListing);

await newListing.save();
  req.flash("success", "New Listing Created!!");
  res.redirect("/listings");
};


module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you are requesting for does not exist");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

//update route controller
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }); // ✅ fixed typo
  if(typeof req.file !== 'undefined'){
  let url = req.file.path;
  let filename =  req.file.filename;
  listing.image = {url,filename};
  await listing.save();
  }
  req.flash("success", "Listing updated!!");
  res.redirect(`/listings/${id}`);
};

//delete route controller
module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id); // ✅ fixed spelling
  if (!deletedListing) {
    req.flash("error", "Listing already deleted or not found.");
    return res.redirect("/listings"); // ✅ added return
  }
  req.flash("success", "Listing Deleted!!");
  res.redirect("/listings");
};