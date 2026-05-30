const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});
  await User.deleteMany({});

  // Seed the default user with the expected ID so listings have a valid owner
  const defaultUser = new User({
    _id: "6879336cc709636684523e89",
    email: "admin@gmail.com",
    username: "admin"
  });
  
  await User.register(defaultUser, "admin123");
  console.log("default user seeded successfully");

  initData.data = initData.data.map((obj)=>({
    ...obj , owner :"6879336cc709636684523e89"
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();