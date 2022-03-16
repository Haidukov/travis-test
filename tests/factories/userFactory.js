const mongoose = require('mongoose');

module.exports = async () => {
    const User = mongoose.model('User');
    return new User({}).save();
};