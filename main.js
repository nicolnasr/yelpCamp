const express          = require('express');
const app              = express();
const bodyParser       = require('body-parser');
const expressSanitizer = require('express-sanitizer');
const methodOverride   = require('method-override');
const mongoose         = require('mongoose');
const passport         = require('passport');
const LocalStrategy    = require('passport-local');
const Campground       = require('./models/campground');
const Comment          = require('./models/comment');
const User             = require('./models/user');
const seedDb           = require('./seeds');
const flash            = require('connect-flash');
const http = require('http');
const port = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1>Hello World</h1>');
});

var commentsRoutes    = require('./routes/comments');
var campgroundsRoutes = require('./routes/campgrounds');
var indexRoutes       = require('./routes/index');


// seedDb();

mongoose.connect("mongodb://localhost/yelp_camp");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.use(express.static("public"));
app.use(require('express-session')({
  secret: "Some Text Here",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors     = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});




app.use(indexRoutes);
app.use(commentsRoutes);
app.use(campgroundsRoutes);




server.listen(port,() => {
  console.log(`Server running at port `+port);
});
