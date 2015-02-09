'use strict';

var passport = require('passport');
var uwshib   = require('passport-uwshib');
var config   = require('../config');

//
// see passport-uwshib for how this works
// https://github.com/drstearns/passport-uwshib
//
var initializeUWShib = function(app) {
  if (config.domain !== 'localhost') {
    app.use(passport.initialize());
    app.use(passport.session());

    // Create the UW Shibboleth Strategy and tell Passport to use it
    var strategy = new uwshib.Strategy({
      entityId: "https://" + config.domain,
      privateKey: config.key,
      callbackUrl: config.callBackURL,
      domain: config.domain
    });

    passport.use(strategy);

    // see passport-uwshib for what the serialization is for
    passport.serializeUser(function(user, done){
        done(null, user);
    });

    passport.deserializeUser(function(user, done){
        done(null, user);
    });

    // Shibboleth routes
    app.get(config.loginURL, passport.authenticate(strategy.name), uwshib.backToUrl());
    app.post(config.callBackURL, passport.authenticate(strategy.name), uwshib.backToUrl());
    app.get(uwshib.urls.metadata, uwshib.metadataRoute(strategy, config.cert));

    // secure all routes
    //app.use(uwshib.ensureAuth(config.loginURL));
  }
};

var verifyAuthorization = function authorize() {
  return function(req, res, next) {
    if (config.domain === 'localhost') {
      next();
    } else {
      if (req.isAuthenticated()) {
        return next();
      } else {
        req.session.authRedirectUrl = req.url;
        res.redirect(config.loginURL);
      }
    }
  };
};

var currentUser = function user(req){
  return config.domain === 'localhost' ? config.testUser : req.user;
};

module.exports.initialize  = initializeUWShib;
module.exports.authorize   = verifyAuthorization;
module.exports.currentUser = currentUser;
