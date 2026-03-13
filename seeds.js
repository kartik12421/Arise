require('dotenv').config();
const mongoose = require('mongoose');
const Tutor = require('./models/Tutor');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/arise-db';
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedTutors = [
    {
        name: 'Aditya Gupta',
        subject: 'Mathematics',
        rating: 5,
        description: 'Expert in algebra & exam preparation.',
        phone: '+918279763625'
    },
    {
        name: 'Mr. Bishal Debnath',
        subject: 'Softskill',
        rating: 5,
        description: 'Spoken English & grammar specialist.',
        phone: '+919851573940'
    },
    {
        name: 'Amit Singh',
        subject: 'Physics',
        rating: 5,
        description: 'Conceptual physics & IIT-JEE prep.',
        phone: '+919876543212'
    },
    {
        name: 'Kartik Joshi',
        subject: 'Computer Science',
        rating: 4,
        description: 'Programming & web development.',
        phone: '+919528316660'
    }
];

const seedDB = async () => {
    await Tutor.deleteMany({});
    await Tutor.insertMany(seedTutors);
    console.log("Database seeded!");
};

seedDB().then(() => {
    mongoose.connection.close();
});
