var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var Comment = require('../models/comment');


router.get('/campgrounds/:id/comments/new', isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCamp) {
        if (err) {
            console.log(err);
        } else {
            res.render('newComment.ejs', { campground: foundCamp });
        }
    })
});

router.post('/campgrounds/:id/comments', function (req, res) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, foundCamp) {
            if (err) {
                console.log(err);
            } else {
                Comment.create(req.body.comment, function (err, comment) {
                    if (err) {
                        console.log(err);
                    } else {
                        comment.author.id = req.user._id;
                        comment.author.username = req.user.username;
                        comment.save();

                        foundCamp.comments.push(comment);
                        foundCamp.save();
                        req.flash('success', 'comment added successfully!');
                        res.redirect('/campgrounds/' + foundCamp._id);
                    }
                });
            }
        })
    } else {
        res.redirect('/login');
    }
    
});

router.get('/campgrounds/:id/comments/:comment_id/edit', checkCommentOwner, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment){
        console.log(req.user);
        res.render('editComment.ejs', { campground_id: req.params.id, comment: foundComment });
    });
});

router.put('/campgrounds/:id/comments/:comment_id', checkCommentOwner, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if(err) {
            res.redirect('back');
        } else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

router.delete('/campgrounds/:id/comments/:comment_id', checkCommentOwner, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if(err) {
            res.redirect('back');
        } else {
            req.flash('error', 'Comment deleted');
            res.redirect('back');
        }
    })
});


function checkCommentOwner(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if(err) {
                res.redirect('back');
            } else {
                if(foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect('back');
                }
            }
        });
    } else {
        res.redirect('back');
    }
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Login first!");
    res.redirect('/login');
}

module.exports = router;