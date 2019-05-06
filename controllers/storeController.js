const mongoose = require('mongoose');
const Store = mongoose.model('Store');

// HomePage: Can be directly done in the Router
exports.homePage = (req, res) => {
    res.render('index',{
        name: 'yolo', 
        category: 'youjou'
    });
};


// Edit: Render une view du form
exports.addStore = (req, res) => {
 res.render('editStore', {
     title: 'Add Store'
 });
};

// Create: save data in the db
exports.createStore = async (req, res) => {
    // console.log(req.body);
    const store = new Store(req.body);
    await store.save();
    res.redirect('/');


};

