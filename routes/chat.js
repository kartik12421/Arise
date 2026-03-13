const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
};

router.get('/:id', isLoggedIn, async (req, res) => {
    try {
        const receiverId = req.params.id;
        
        if (receiverId === req.user._id.toString()) {
            req.flash('error', 'You cannot chat with yourself!');
            return res.redirect('/chat');
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            req.flash('error', 'User not found!');
            return res.redirect('/chat');
        }

        const messages = await Chat.find({
            $or: [
                { sender: req.user._id, receiver: receiverId },
                { sender: receiverId, receiver: req.user._id }
            ]
        }).sort('createdAt');

        // Find all users this person has messaged or received messages from
        const chatUsers = await Chat.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        }).select('sender receiver');

        const userIds = new Set();
        chatUsers.forEach(chat => {
            if (chat.sender.toString() !== req.user._id.toString()) userIds.add(chat.sender.toString());
            if (chat.receiver.toString() !== req.user._id.toString()) userIds.add(chat.receiver.toString());
        });

        // Always include the current receiver (the person we are currently chatting with)
        userIds.add(receiverId);

        const contacts = await User.find({ _id: { $in: Array.from(userIds) } });
        res.render('chat', { messages, receiver, contacts, onlineUsers: req.onlineUsers });
    } catch (e) {
        console.error(e);
        req.flash('error', 'Something went wrong!');
        res.redirect('/chat');
    }
});

router.get('/', isLoggedIn, async (req, res) => {
    try {
        const chatUsers = await Chat.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        }).select('sender receiver');

        const userIds = new Set();
        chatUsers.forEach(chat => {
            if (chat.sender.toString() !== req.user._id.toString()) userIds.add(chat.sender.toString());
            if (chat.receiver.toString() !== req.user._id.toString()) userIds.add(chat.receiver.toString());
        });

        const contacts = await User.find({ _id: { $in: Array.from(userIds) } });
        res.render('chat', { messages: [], receiver: null, contacts, onlineUsers: req.onlineUsers });
    } catch (e) {
        console.error(e);
        res.redirect('/');
    }
});



module.exports = router;
