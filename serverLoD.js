var express = require('express'); // Express web server framework
var mongoose = require('mongoose'); // Mongoose database
var bodyParser = require('body-parser'); // Body parser for handling POST requests
var ejs_mate = require('ejs-mate');// page format EJS
var cookieParser = require('cookie-parser'); // cookie parser
var flash = require('express-flash'); // flash messages
const session = require('express-session');  // session middleware
const passport = require('passport');  // authentication
const { Server } = require("socket.io"); // socket.io
var http = require('http'); // http server
let myIP;
 
var secret = require('./config/secret');

var app = module.exports.app = express();

mongoose.connect(secret.database, function(err){
	if (err) {
		console.log(err);
	} else {
		console.log("Connected to the database")
	}
});

app.use(express.static(__dirname + '/public'));

// For Morgan Logger
// var morgan = require('morgan');
// app.use(morgan('dev'));

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
	resave: false,
	saveUninitialized: true,
	secret: secret.secretKey,
	cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
	res.locals.user = req.user;
	next();
});

app.engine('ejs', ejs_mate);
var apiRoutes = require('./api/api');
app.set('view engine', 'ejs');
var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');

app.use(apiRoutes);
app.use(mainRoutes);
app.use(userRoutes);
app.get('*', function (req, res, next){
	res.redirect('/');
});

var server = http.createServer(app);

server.listen(secret.port, function(err) {
	if (err) throw err;
	console.log("Server is Running" + secret.port);
	http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
		resp.on('data', function(ip) {
		  console.log("My Ip is: " + ip);
		  myIP = ip;
		  var name = "SelfHosted" + Math.floor(Math.random() * 999);
		  http.get({'host': '130.185.118.9', 'port': 3000, 'path': '/api/servers/submit?Name=' + name + '&Motd=SelfHosted&IP=' + ip}, function(resp) {
			resp.on('data', function(dat) {
			  console.log("Submited server! Result: " + dat);
			});
		  });
		});
	});
});

const io = new Server(server);
var ioFramework = require('./middlewares/io.js')(io);
