const { userSchema, studentSchema, tutorSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');

module.exports.validateRegistration = (req, res, next) => {
    // Basic user validation (allow other fields)
    const { error: userError } = userSchema.validate(req.body, { allowUnknown: true });
    if (userError) {
        const msg = userError.details.map(el => el.message).join(',');
        req.flash('error', msg);
        return res.redirect('/register');
    }

    if (req.body.role === 'student') {
        const { error: studentError } = studentSchema.validate({
            courseInterested: req.body.courseInterested
        });
        if (studentError) {
            const msg = studentError.details.map(el => el.message).join(',');
            req.flash('error', msg);
            return res.redirect('/register');
        }
    } else if (req.body.role === 'tutor') {
        let skills = req.body.skills;
        if (skills && typeof skills === 'string') {
            try {
                skills = JSON.parse(skills);
            } catch (e) {
                skills = [skills];
            }
        }

        const { error: tutorError } = tutorSchema.validate({
            subject: req.body.subject,
            experience: req.body.experience,
            skills: skills || [],
            phone: req.body.phone,
            description: req.body.description
        });
         if (tutorError) {
            const msg = tutorError.details.map(el => el.message).join(',');
            req.flash('error', msg);
            return res.redirect('/register');
        }
    }
    next();
}
