//  !!!!!!! DON'T FORGET to require model in Start.js
const mongoose = require('mongoose'); 
mongoose.Promise = global.Promise;
const slug = require('slugs');


// SCHEMA 
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
    photo: String, 
    author: {
        type: mongoose.Schema.ObjectId, 
        ref: 'User', 
        required: 'You must supply an author'
    }
},

    // //ADD THE LOCATION 
    // location: {
    //     type: {
    //         type: String, 
    //         default: 'Point'
    //     },
    //     coordinates: [{
    //         type: Number,
    //         required: 'You must supply coordinates!'
    //     }],
    //     address: {
    //         type: String, 
    //         required: 'You must supply an address! ' 
    //     }
    // }, 
    {
      toJSON: { virtuals: true}, // allow you see with pre=h.dump(store) all the virtual JSON and virtual Objects
      toObject: {virtuals: true},
    }
    );

// INDEX FOR SEARCHBAR
storeSchema.index({ // which filed you allow people to search via this search bar
    name: 'text', 
    description: 'text'
});

// UPDATE STORE
storeSchema.pre('save', function(next){
    if (!this.isModified('name')){
        next();
        return;
    }
    this.slug = slug(this.name);
     next();
});


//====================================================================
//                                      TAGS
//====================================================================
// Our OWN FUnction  to find Tags 
storeSchema.statics.getTagsList = function() { // statics make our own method work
        return this.aggregate([ //Agregate is like findById for many parameters for Mongo
            // to know the diff agregate operators check MongoDb doc
            { $unwind: '$tags'},
            { $group: { _id: '$tags', count: { $sum: 1 } } }, // group eerything based on the tag field  and create a new field count that sum +1 each time 
            { $sort: { count: -1 } }// sort by most popular (1 is ascending, -1 is descending)
        ]);
}; 


//====================================================================
//                                      REVIEWS
//====================================================================// To be able on the store to have access to reviews
// INDEX 
//find reviews where the stores _id property === reviews store property
storeSchema.virtual('reviews', {
// Tell to go off to an other model and make a query 
    ref: 'Review',  // what model to link
    localField: '_id', // witch field on the store 
    foreignField: 'store' // witch fields on the review
});

module.exports = mongoose.model('Store', storeSchema); 