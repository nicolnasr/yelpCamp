var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

router.get('/', function (req, res) {
    res.render('landing.ejs');
});

router.get('/user/:user_id', isLoggedIn, function (req, res) {
    User.findById(req.params.user_id, function (err, foundUser) {
        if (err) {
            res.redirect('back');
        } else {
            res.render('user.ejs');
        }
    });
});

router.get('/register', function (req, res) {
    res.render('register.ejs');
});

router.post('/register', function (req, res) {
    var newUser = new User({ username: req.body.username, email: req.body.email, phone: req.body.number });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            req.flash("error", err.message);
            res.redirect('/register');
        }
        passport.authenticate('local')(req, res, function () {
            req.flash("success", "Successfully registered");
            res.redirect('/campgrounds');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login.ejs');
});

router.post('/login', passport.authenticate("local",
    {
        failureRedirect: '/login'
    }), function (req, res) {
        req.flash("success", "Logged in successfully!!");
        res.redirect('/campgrounds');
});

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', "Logged out successfully");
    res.redirect('/campgrounds');
});



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Login first!");
    res.redirect('/login');
}


module.exports = router;