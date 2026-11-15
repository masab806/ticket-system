const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        trim: true,
        default: ''
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ["user","organizer","admin"],
        default: "user"
    },
    verified: {
        type: Boolean,
        default: false
    },

    verificationToken: {
        type: String
    },

    verificationTokenExpires: {
        type: Date
    }

});

module.exports = mongoose.model('User', userSchema);