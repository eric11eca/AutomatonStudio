const express = require("express"),
      session = require("express-session"),
      compression = require("compression"),
      bodyParser = require('body-parser'),
			helmet = require('helmet'),
			path = require('path');
			
let stateAutomaton = require("./app/stateAutomaton.js");


let app = express();
const routes = require(path.join(path.join(__dirname, 'routes'), 'main'));

app.use(helmet.hsts({
  maxAge: 31536000000,
  includeSubDomains: true,
  force: true
}));

const server = require("http").createServer(app);

let cacheTime = 14 * 24 * 60 * 60 * 1000;
app.use(compression());
//app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'), {maxAge: cacheTime}));
//app.set("view engine", "pug");
app.use(express.urlencoded({extended: true}));

let userSession = (session({
	secret: process.env.SESSION_SECRET || 
		"++computationallogicrocksthisphysicalworld++",
  resave: true,
  saveUninitialized: true,
  authenticated: false
}));

app.use(userSession);
for (let pages in routes){
  app.use(pages, routes[pages]);
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// create routes for all the pages
for (let pages in routes){
  app.use(pages, routes[pages]);
}

app.get('/createAutomaton', function(req, res, next) {
	stateAutomaton();
});




server.listen(process.env.PORT || 4000, () => {
  console.log("server is live on port 4000");
});