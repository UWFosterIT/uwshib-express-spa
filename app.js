var fs           = require('fs');
var path         = require('path');
var express      = require("express");
var favicon      = require('serve-favicon');
var morgan       = require('morgan');
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var shibboleth   = require('./helpers/shibboleth');
var config       = require('./config');

// Setup Express
var app = express();

app.locals.shibboleth = null;
app.use(morgan(process.env.LOGFORMAT || 'dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({type: 'application/json'}));
app.use(cookieParser());
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: fs.readFileSync(config.secretFile, 'utf-8'),
    cookie: {secret: true}
}));

shibboleth.initialize(app);
var routes = require('./routes/index')(shibboleth);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler, no stacktraces leaked to user outside of dev environment
app.use(function(err, req, res, next) {
  stack = app.get('env') === 'development' ? err.stack : {};
  msg   = { message: err.message, error: stack };

  res.status(err.status || 500).json(msg);
});

module.exports = app;
