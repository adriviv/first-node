//                      SET UP DB and Model
// ============================================================================ 
const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');

//                      SET UP UPLOAD IMAGE  
// ============================================================================ 
const multer = require('multer');
const jimp = require('jimp'); // Allow to resize a photo 
const uuid = require('uuid'); // provide unique Image ID, not overwhrite when 2 image have same name

const multerOptions = {
   // 1- first store the image in the tempoprary memory
    storage: multer.memoryStorage(),
   // 2- What kind of file is ok  
   fileFilter(req, file, next){
       const isPhoto = file.mimetype.startsWith('image/') ;// here all image format. 'image/jpeg' say only jpeg
       if(isPhoto) {
           next(null, true);
       } else {
            next({ message: 'That type of file is not allowed'}, false);
       }
   }
};




//=============================================================================
//                             STORE CRUD
// ============================================================================ 

//                              INDEX
// -------------------------------------------------------------------------
exports.getStores = async (req, res) => {
    // 1 Query the strores present in the database 
    const stores = await Store.find();
    // console.log(stores);
    res.render('stores', { title: 'Stores', stores });
};


//                              SHOW
// -------------------------------------------------------------------------
exports.getStoreBySlug = async (req, res, next) => {
    // res.json(req.params); ==> to see all the data return
    const store = await Store.findOne({ slug: req.params.slug }).populate('author reviews'); // populate: find the associate model and give access to all ots informations. 
    if (!store) return next();
     //res.json(store); // to see all the data that it is returned
     res.render('store', { store, title: store.name});
};

//                              ADD / CREATE
// -------------------------------------------------------------------------
// ADD: Render une view du form
exports.addStore = (req, res) => {
 res.render('editStore', {
     title: 'Add Store'
 });
};


// CREATE: save data in the db
exports.createStore = async (req, res) => {
    // console.log(req.body);
    req.body.author = req.user._id; // make the reference to the user that has created the store. 
    const store = new Store(req.body);
    await store.save();
    req.flash('success', `You successfully created the restaurant ${store.name}.`);
    res.redirect(`/store/${store.slug}`);
};


//                              EDIT / UPDATE 
// -------------------------------------------------------------------------
// CONFIRM OWNER 
const confirmOwner = (store, user) => {
    if (!store.author.equals(user._id)){
        throw Error('You must own a store in order to edit it');
    };
};


// EDIT 
exports.editStore = async (req, res) => {
    // 1 - find the store ID 
    const store = await Store.findOne({ _id: req.params.id}); 
    // 2 confirm they are the owner of the store
    confirmOwner(store, req.user);
    // 3 Render out the edit form so the user cand update their store
    res.render('editStore', { title: `Edit ${store.name}`, store });
};

// UPDATE
exports.updateStore = async (req, res) => {
    // set the location data to be a point
    // req.body.location = 'Point'; // type come from model 
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




//=========================================================================.
//                              UPLOAD IMAGE
//.=========================================================================
//1 - UPLOAD IMAGE thks to Multer that store in the temporary memory
exports.upload = multer(multerOptions).single('photo');


// 2 - RESIZE IMAGE before store in the db 
exports.resize = async (req, res, next) => {
    // 1 -- Check if there is no new file to resize
    if (!req.file){ 
        next(); // skip to the next middleware
        return;
    }
    // console.log(req.file); ==> Ce qui nous donne le buffer 

    // 2-- Unique Name 
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;// split name and extention. keep only the etention and asign unique name
    
    // 3-- Resize Image
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO); //from jimp documentation to make it auto 
    await photo.write(`./public/uploads/${req.body.photo}`); // write the file at this location
    next(); 
}


//=========================================================================.
//                              TAG CONTROLLER 
//=========================================================================.
exports.getStoresByTag = async (req, res) => {
    // res.send('it works') // test if the routes is working 
    const tag = req.params.tag;
    const tagQuery = tag || {$exists: true}; // when no tags specify , show all 

    const tagsPromise = Store.getTagsList(); // create our ow method get TagsList in Store Model to fin tags 
    const storesPromise = Store.find({ tags: tagQuery});
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]); // We do 2 queries and wait for both finish to go to next step 
    // res.json(stores); // intermediary step to see info of store we have
    // res.json(tags); // intermediary step to see info of tags

     res.render('tag', { tags, title: 'Tags', tag, stores})
};


//=========================================================================.
//                             SEARCH BAR 
//=========================================================================.
// INDEX 
exports.searchStores = async (req, res) => {
    // res.json({ it: 'Worked'}) //to test the route 
    const stores = await Store
    // 1-  First find stores that mattch with the query 
    .find( { $text : { $search: req.query.q } },// => what is the input  
           { score: { $meta: 'textScore' } } // What is the score to order 
        )
    // 2 - Sort them
    .sort(
          { score: { $meta: 'textScore' } }
        )   
    // 3 - limit only to 5 results
    .limit(5);
    res.json(stores); // to test what is the result in json 
};


//=========================================================================.
//                             FAVORITES / HEARTS
//=========================================================================.
// ADD & DESTROY 
exports.heartStore = async (req, res) => {
    // 1 - list all the hearts id 
    const hearts = req.user.hearts.map(obj => obj.toString()); 
    // 2 -  check if the heart is already in the array : if it is we remove, otherwise we add 
    const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet' ; // MongoDb method => $pull = rm / push = add / BUT bc we want to be unique we usse $addToSet
    const user = await User
    .findByIdAndUpdate(req.user._id,
        { [operator]: { hearts: req.params.id }},
        { new: true }
    );
    res.json(user); // when click on the heart should add one store in the list of heart , if already favorites shoud remove one 
    // to check the heart color active or not ==> cf storeCard.pug ligne 9 - 13
    // to make the hart stay red or white without reload the page => CF public/javascript/heart.js 
}

