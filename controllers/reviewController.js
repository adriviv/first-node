const mongoose = require('mongoose'); // have access to database
const Review = mongoose.model('Review');
//=====================================================================
//=====================================================================


//                              ADD 
// -------------------------------------------------------
exports.addReview = async (req, res) => {
    // res.json(req.body); 
    // when console.log See only text and rating. We want all params from the model so we add them mannualy 
    req.body.author = req.user._id; // save this review in the user 
    req.body.store = req.params.id; // save this review in the store
     // res.json(req.body); 
     const newReview = new Review(req.body);
     await newReview.save();
     req.flash('success', 'The Review has been saved')
     res.redirect('back');
}; 
