const Joi = require('joi');

module.exports.userSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().valid('student', 'tutor').required()
});

module.exports.studentSchema = Joi.object({
    courseInterested: Joi.string().allow('', null)
});

module.exports.tutorSchema = Joi.object({
    subject: Joi.string().required(),
    experience: Joi.number().min(0).required(),
    skills: Joi.array().items(Joi.string()).default([]),
    image: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    phone: Joi.string().allow('', null)
});
