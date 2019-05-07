const mongoose = require('mongoose'); 
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type: String, 
        trin: true, 
        required: 'Please enter a store name!'
    },
    slug: String, 
    description: {
        type: String, 
        trin: true
    },
    tags: [String],
    // CREATED AT IS NOT BY DEFAULT 
    created: {
        type: Date,
        default: Date.now
    },


    // ADD THE LOCATION 
    location: {
        type: {
            type: String, 
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates!'
        }],
        address: {
            type: String, 
            required: 'You must supply an address! ' 
        }
    }
});

storeSchema.pre('save', function(next){
    if (!this.isModified('name')){
        next();
        return;
    }
    this.slug = slug(this.name);
    next();
});

module.exports = mongoose.model('Store', storeSchema); 