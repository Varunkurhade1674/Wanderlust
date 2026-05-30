const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { required } = require("joi");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url:String,
    filename : String,
  },
  price: Number,
  location: String,
  country: String,
  reviews:[
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
},
],//for authorization purpose
  category: {
    type: String,
    enum: ["Trending", "Rooms", "Iconic cities", "Mountains", "Castles", "Pools", "Camping", "Farms", "Arctic", "Domes", "Breakfast"],
    required: true,
  },
  owner:{
      type: Schema.Types.ObjectId,
      ref: "User",
  },
geometry: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point' // default so it's valid if no coordinates are set
  },
  coordinates: {
    type: [Number],
    default: [-74.006, 40.7128] // fallback coordinates
  },
},

});

//post mongoose middlewaree 
listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
await Review.deleteMany({_id : {$in : listing.reviews}});
  }
  
})


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
