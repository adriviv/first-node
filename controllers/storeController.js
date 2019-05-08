//                      SET UP DB and Model
// ============================================================================ 
const mongoose = require('mongoose');
const Store = mongoose.model('Store');

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
    const store = await Store.findOne({ slug: req.params.slug });
    if (!store) return next();
     res.json(store); // to see all the data that it is returned
    // res.render('store', { store, title: store.name});
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
    const store = new Store(req.body);
    await store.save();
    req.flash('success', `You successfully created the restaurant ${store.name}.`);
    res.redirect(`/store/${store.slug}`);
};


//                              EDIT / UPDATE 
// -------------------------------------------------------------------------
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