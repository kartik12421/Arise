const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tutorSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    subject: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        default: 0
    },
    skills: [String],
    rating: {
        type: Number,
        default: 5
    },
    description: String,
    image: String,
    phone: String
});

module.exports = mongoose.model('Tutor', tutorSchema);
