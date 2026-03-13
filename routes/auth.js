const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const { validateRegistration } = require('../middleware');

const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', upload.single('image'), validateRegistration, async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;
        
        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            req.flash('error', 'A user with that email already exists.');
            return res.redirect('/register');
        }

        const user = new User({ email, username, role });
        const registeredUser = await User.register(user, password);

        if (role === 'student') {
            const student = new Student({
                user: registeredUser._id,
                courseInterested: req.body.courseInterested
            });
            await student.save();
        } else if (role === 'tutor') {
            let skills = [];
            if (req.body.skills) {
                try {
                    skills = JSON.parse(req.body.skills);
                } catch (e) {
                    skills = Array.isArray(req.body.skills) ? req.body.skills : [req.body.skills];
                }
            }

            const tutor = new Tutor({
                user: registeredUser._id,
                subject: req.body.subject,
                experience: req.body.experience,
                skills: skills,
                description: req.body.description,
                phone: req.body.phone,
                image: req.file ? req.file.path : ''
            });
            await tutor.save();
        }

        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Arise!');
            res.redirect('/');
        });

    } catch (e) {
        console.error("Registration Error:", e);
        req.flash('error', e.message);
        res.redirect('/register');
    }
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), (req, res) => {
    req.flash('success', 'Successfully logged in!');
    res.redirect('/');
});

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logged out!');
        res.redirect('/');
    });
});

module.exports = router;
