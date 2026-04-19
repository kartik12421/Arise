const express = require('express');
const router = express.Router();
const Tutor = require('../models/Tutor');
const User = require('../models/User'); // Import User model

const { isApproved } = require('../middleware');

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
};

router.get('/', isLoggedIn, isApproved, async (req, res) => {
    // Populate 'user' to get username for the card if needed
    const tutors = await Tutor.find({}).populate('user');
    res.render('tutors', { tutors });
});

router.get('/:id', isLoggedIn, isApproved, async (req, res) => {
    const tutor = await Tutor.findById(req.params.id).populate('user');
    res.render('tutor_detail', { tutor });
});

module.exports = router;
