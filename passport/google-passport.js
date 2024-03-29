const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.js');
const keys = require('../config/keys.js');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id)
        .exec()
        .then((user) => {
            done(null, user);
        })
        .catch((err) => {
            done(err);
        });
});

passport.use(new GoogleStrategy({
    clientID: keys.GoogleClientID,
    clientSecret: keys.GoogleClientSecret,
    callbackURL: "/auth/google/callback",
    proxy: true
},
    (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        console.log(profile.photos[0].value);
        User.findOne({
            google: profile.id
        }).then((user) => {
            if (user) {
                done(null, user);
            } else {
                const newUser = {
                    google: profile.id,
                    fullname: profile.displayName,
                    lastname: profile.name.familyName,
                    firstname: profile.name.givenName,
                    email: profile.emails[0].value,
                    image: profile.photos[0].value
                }
                // save new user into database
                new User(newUser).save()
                    .then((user) => {
                        done(null, user);
                    })
            }
        })
    }
));
