const mongoose = require ('mongoose');
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply an author!'
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: 'You must supply a store!'
    },
    text: {
        type: String, 
        required: 'Your review must have a text!'
    },
    rating: {
        type: Number, 
        min: 1, 
        max: 5
    }
});

// EACH OF AUTHOR INFORMATION WILL BE ACCESSIBLE thanks to that
//=======================================================
// when the author is queried , it automaticcaly autopopulate for us that we need information abot the author
// c'est pour transformer le author qui est 5362C3jhc4444YY4 en username, avatar etc .. 
function autopopulate(next) {
    this.populate('author');
    next();
}

reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate);
//=======================================================


// Then go to sart.js to require it. 
module.exports = mongoose.model('Review', reviewSchema);
