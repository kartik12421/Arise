const express = require('express');
const router = express.Router();
const User = require('../models/User');

const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    req.flash('error', 'Access Denied!');
    res.redirect('/');
};

router.get('/dashboard', isAdmin, async (req, res) => {
    const pendingUsers = await User.find({ isApproved: false, isAdmin: false });
    res.render('admin/dashboard', { pendingUsers });
});

router.post('/approve/:id', isAdmin, async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isApproved: true });
    req.flash('success', 'User Approved!');
    res.redirect('/admin/dashboard');
});

router.post('/reject/:id', isAdmin, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success', 'User Rejected and Removed.');
    res.redirect('/admin/dashboard');
});

module.exports = router;
