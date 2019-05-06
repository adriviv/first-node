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
    descritpion: {
        type: String, 
        trin: true
    },
    tags: [String]
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