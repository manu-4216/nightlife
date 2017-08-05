var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    },

    // List of places where the user is going
    places: {
        type: [String],
        default: []
    }
})

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password)
}

// create the model for users and expose it to our app
module.exports = mongoose.model('Users', userSchema)
