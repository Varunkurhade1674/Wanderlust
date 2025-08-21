if(process.env.NODE_ENV != "production"){//when it is not equal we use dotenv 
require('dotenv').config();//logic bheind it is used to load the environment variables from .env file
}

console.log(process.env.SECRET);


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path =require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError =require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//after restrcucting requring the listing and review 
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
//const MongoStore = require('connect-mongo');
const dbUrl = process.env.ATLASDB_URL;
main()
  .then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});
async function main(){
   await mongoose.connect( dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate  );
app.use(express.static(path.join(__dirname, "/public")));//to use static files


const store = MongoStore.create ({
  mongoUrl: dbUrl,
  crypto:{
    secret: process.env.SECRET ,
  },
  touchAfter: 24 * 3600, //  updates after this time interval session
});
//express session 
const sessionOptions = {
  store,
  secret :process.env.SECRET ,
    resave:false, 
    saveUninitialized:true,
    cookie:{
      expries : Date.now() +7 *60 *60 *1000,
      maxAge : 7*24*60*60*1000,
      httpOnlu : true,//for security purpose-to avoid cross scripting sites
    },
  };

//app.get("/",(req,res)=>{
  //  res.send("hi,i am root");
//});
store.on("error",()=>{
  console.log("session store error",err);
});

//express session and flash
app.use(session(sessionOptions));
app.use(flash());

//passport implementation to implent our passport we need a session 
//passport.initailize as middleware
app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));//authenticate() Generates a function that is used in Passport's LocalStrategy
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());//serializeUser() Generates a function that is used by Passport to serialize users into the session
passport.deserializeUser(User.deserializeUser());//deserializeUser() Generates a function that is used by Passport to deserialize users into the session



//middleware
app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
   res.locals.error = req.flash("error");
   res.locals.currUser = req.user;
  //console.log(res.locals.success);
  next();//call next bcz if we wont call it it will remian struck at the same middle ware
})

//demo user
//app.get("/demouser",async(req,res)=>{
  //let fakeUser = new User({
    //username:"delta-student",
  ///  email:"student@gmail.com",
//});

  //let registeredUser = await User.register(fakeUser,"helloworld");//register(user, password, cb) Convenience method to register a new user instance with a given password. Checks if username is unique. See login example.
  //res.send(registeredUser);
//});
//after restructuring 
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter);

//app.get("/testListing",async(req,res)=>{
  // let sampleListing = new Listing({
   //title : "my new villa",
     // description : "by the beach",
       // price : 1200,
        //location : "goa",
        //country : "India",
    //});
    //await sampleListing.save();console.log("sample was saved");
    //res.send("successful testing");});


//app.all("*",(req,res,next)=>{
  //next(new ExpressError(404,"Page Not Found!"));
//});


/* ---------- 404 & error handlers ---------- */
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

//error handling
app.use((err,req,res,next)=>{
 let {StatusCode =500,message ="something went wrong"} =err;
 res.status(StatusCode).render("error.ejs",{message});
 //res.status(StatusCode).send({message});
});


app.listen(8080,()=>{
    console.log("server is listening on 8080 port");
    
});

