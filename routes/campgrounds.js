var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');

router.get('/campgrounds', function (req, res) {
    Campground.find({}, function (err, campgrounds) {
        if (err) {
            console.log(err)
        } else {
            res.render('index.ejs', { campground: campgrounds, currentUser: req.user });
        }
    })
});

router.get('/campgrounds/new', isLoggedIn, function (req, res) {
    if (req.isAuthenticated()) {
        res.render('newCampground.ejs');
    } else {
        res.redirect('/login');
    }
    
});

router.post('/campgrounds', isLoggedIn, function (req, res) {
    req.body.camp.body = req.sanitize(req.body.camp.body);
    Campground.create(req.body.camp, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            newlyCreated.author.id = req.user._id;
            newlyCreated.author.username = req.user.username;
            newlyCreated.save();

            res.redirect('/campgrounds');
        }
    });
});

router.get('/campgrounds/:id', function (req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            req.flash('error', "Campground  " + "  ' " + err.value + " ' " +  " Not Found!");
            res.redirect('/campgrounds');
        } else {
            res.render('show.ejs', { campground: foundCampground })
        }
    });
});

router.get('/campgrounds/:id/edit', checkCampgroundOwner, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCamp) {
        res.render('edit.ejs', { camp: foundCamp });
    });
});

router.put('/campgrounds/:id', checkCampgroundOwner, function (req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.camp, function (err, updatedCamp) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    })
});

router.delete('/campgrounds/:id', checkCampgroundOwner, function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/campgrounds');
        }
    })
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Login first!");
    res.redirect('/login');
}

function checkCampgroundOwner(req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, foundCamp) {
            if (err) {
                res.redirect('back');
            } else {
                if (foundCamp.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash('error', 'cannot perform this task');
                    res.redirect('/campgrounds/' + req.params.id);
                }
            }
        });
    } else {
        req.flash('error', "You need to be logged in!")
        res.redirect('/campgrounds');
    }
}


module.exports = router;