if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const User = require('./models/User');
const Chat = require('./models/Chat');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Connect to MongoDB
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/arise-db';
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    name: 'session',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    const successMessages = req.flash('success');
    const errorMessages = req.flash('error');
    res.locals.success = successMessages.length > 0 ? successMessages[0] : null;
    res.locals.error = errorMessages.length > 0 ? errorMessages[0] : null;
    next();
});

// Socket.io Logic
const onlineUsers = new Set();

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a private room based on User ID
    socket.on('join', (userId) => {
        socket.userId = userId; // Associate userId with the socket
        socket.join(userId);
        onlineUsers.add(userId);
        io.emit('user_online', userId); // Inform all clients
        console.log(`User ${userId} joined their private room and is online.`);
    });

    // Handle sending message
    socket.on('send_message', async (data) => {
        const { senderId, receiverId, message } = data;
        
        try {
            // Save to Database
            const newChat = new Chat({
                sender: senderId,
                receiver: receiverId,
                message: message
            });
            await newChat.save();

            // Emit to receiver's private room
            io.to(receiverId).emit('receive_message', {
                senderId,
                message,
                createdAt: newChat.createdAt
            });

            // Emit back to sender (for confirmation/UI update)
            socket.emit('message_sent', {
                message,
                createdAt: newChat.createdAt
            });

        } catch (e) {
            console.error('Socket Error:', e);
        }
    });

    socket.on('disconnect', () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit('user_offline', socket.userId); // Inform all clients
            console.log(`User ${socket.userId} disconnected and is offline.`);
        } else {
            console.log('An anonymous user disconnected');
        }
    });
});

const authRoutes = require('./routes/auth');
const tutorRoutes = require('./routes/tutor');
const chatRoutes = require('./routes/chat');

// Make onlineUsers available to routes
app.use((req, res, next) => {
    req.onlineUsers = onlineUsers;
    next();
});

app.use('/', authRoutes);
app.use('/tutors', tutorRoutes);
app.use('/chat', chatRoutes);

// Routes will be added here
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.use((req, res, next) => {
    res.status(404).render('error', { message: 'Page Not Found', error: { status: 404 } });
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render('error', { error: err });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
