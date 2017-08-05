var mongoose = require('mongoose');
var placesSchema = mongoose.Schema({

    id            : {
        type        : String
    },

    usersCount: {
        type: Number,
        default: 0
    }

})

// methods ======================
//

// create the model for users and expose it to our app
module.exports = mongoose.model('Places', placesSchema)
