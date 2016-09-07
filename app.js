var express = require('express')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , favicon = require ('favicon')
  , session = require ('express-session')
  , bodyParser = require ('body-parser')
  , cookieParser = require ('cookie-parser')
  , methodOverride = require('method-override')
  , router = express.Router()

//==================================================================
// Define the strategy to be used by PassportJS
passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log(username + ' - ' + password);
    if (username === "admin" && password === "admin") // stupid example
      return done(null, {name: "admin"});

    return done(null, false, { message: 'Incorrect username.' });
  }
));

// Serialized and deserialized methods when got from session
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Define a middleware function to be used for every secured routes
var auth = function(req, res, next){
  console.log('auth : '+ req.user);
  if (!req.isAuthenticated())
  	res.send(401);
  else
  	next();
};
//==================================================================

// Start express application
var app = express();
app.disable('x-powered-by')
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(session({
  secret: 'SJLgbSPo',
  secret: 'BkJRzLjs',
  resave: true,
  saveUninitialized: true,
  //cookie: { secure: true }
  //  cookie secure does not work with http but https
  //  to use this option ther is a need to have an https server available
}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());    // Add passport initialization
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  //app.use(errorHandler());
}

//==================================================================
// routes
app.all ('*', function (req, res, next){
  console.log(req.body);
  next()
})
app.get('/', function(req, res){
  res.render('index', { title: 'Express' });
});

app.get('/users', auth, function(req, res){
  res.send([{name: "user1"}, {name: "user2"}]);
});
//==================================================================

//==================================================================
// route to test if the user is logged in or not
app.get('/loggedin', function(req, res) {
  console.log('check if /loggedin');
  console.log(req.user);
  res.send(req.isAuthenticated() ? req.user : '0');
});

// route to log in
app.post('/login', passport.authenticate('local'), function(req, res) {
  console.log('login ' + req.user);
  res.send(req.user);
});

// route to log out
app.post('/logout', function(req, res){
  req.logOut();
  res.send(200);
});
//==================================================================

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
