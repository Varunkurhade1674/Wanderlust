if (process.env.NODE_ENV != "production") {
  //when it is not equal we use dotenv 
  require('dotenv').config(); //logic behind it is used to load the environment variables from .env file
}

console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//after restructuring requiring the listing and review 
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public"))); //to use static files

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, // updates after this time interval session
});

//express session 
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expries: Date.now() + 7 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnlu: true, //for security purpose-to avoid cross scripting sites
  },
};

store.on("error", () => {
  console.log("session store error", err);
});

//express session and flash
app.use(session(sessionOptions));
app.use(flash());

//passport implementation
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ✅ Redirect root to /listings
app.get("/", (req, res) => {
  res.redirect("/listings");
});

//after restructuring 
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

/* ---------- 404 & error handlers ---------- */
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

//error handling
app.use((err, req, res, next) => {
  let { StatusCode = 500, message = "something went wrong" } = err;
  res.status(StatusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server is listening on 8080 port");
});
