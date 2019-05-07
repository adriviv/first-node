// SET UP 
const mongoose = require('mongoose');
const Store = mongoose.model('Store');

// HomePage: Can be directly done in the Router
// exports.homePage = (req, res) => {
//     res.render('index',{
//         name: 'yolo', 
//         category: 'youjou'
//     });
// };

// ============================================================================ 
//INDEX
exports.getStores = async (req, res) => {
    // 1 Query the strores present in the database 
    const stores = await Store.find();
    // console.log(stores);
    res.render('stores', { title: 'Stores', stores });
};


// ============================================================================ 
// ADD: Render une view du form
exports.addStore = (req, res) => {
 res.render('editStore', {
     title: 'Add Store'
 });
};

// CREATE: save data in the db
exports.createStore = async (req, res) => {
    // console.log(req.body);
    const store = new Store(req.body);
    await store.save();
    req.flash('success', `You successfully created the restaurant ${store.name}.`);
    res.redirect(`/store/${store.slug}`);
};


// ============================================================================ 
// EDIT
exports.editStore = async (req, res) => {
    // 1 - find the store ID 
    const store = await Store.findOne({ _id: req.params.id}); 
    // 2 confirm they are the owner of the store
        // TODO
    // 3 Render out the edit form so the user cand update their store
    res.render('editStore', { title: `Edit ${store.name}`, store });
};

// UPDATE
exports.updateStore = async (req, res) => {
    // set the location data to be a point
    req.body.location.type = 'Point';
    // 1 - Find and update the store
    const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, {
        new: true, // return the new store instead of the old one
        runValidators: true // run les validators du models
    }).exec();
    // 2 - Inform that is has been updated
    req.flash('success', `Successfully updated ${store.name}`)
    // 3 - redirect to Restaurant page  
    res.redirect(`/stores/`);
};

