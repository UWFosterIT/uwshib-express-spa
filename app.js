/* eslint-disable key-spacing */
'use strict';

let fs           = require('fs');
let path         = require('path');
let express      = require('express');
let favicon      = require('serve-favicon');
let morgan       = require('morgan');
let bodyParser   = require('body-parser');
let cookieParser = require('cookie-parser');
let session      = require('cookie-session');
let shibboleth   = require('./helpers/shibboleth');
let config       = require('./config');

// Setup Express
let app = express();

app.use(morgan(process.env.LOGFORMAT || 'dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({type: 'application/json'}));
app.use(cookieParser());
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

// refer to https://github.com/expressjs/cookie-session
// the cookie will be secure in production and permitted to be sent there
app.use(session({
    secret: fs.readFileSync(config.secretFile, 'utf-8'),
    secure: false,
    secureProxy: true
}));

shibboleth.initialize(app);
let routes = require('./routes/index')(shibboleth);
app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler, no stacktraces leaked to user outside of dev environment
app.use((err, req, res) => {
  let stack = app.get('env') === 'development' ? err.stack : {};
  let msg   = { message: err.message, error: stack };

  res.status(err.status || 500).json(msg);
});

module.exports = app;
