// !!!!!!!!  DON'T FORGET to require model in Start.js

const mongoose = require('mongoose');
const User = mongoose.model('User');

const promisify = require('es6-promisify');


//                       REGISTER 
// ============================================================
//REGISTER FORM 
exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

// VALIDATES THE DATA IN THE FORM 
exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That Email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    gmail_remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return; // stop the fn from running
  }
  next(); // there were no errors!
};


// CREATE A NEW USER 
exports.register = async (req, res, next) => {
  const user = new User({email: req.body.email, name: req.body.name });
  const register = promisify(User.register, User); // encrypt the password
  await register(user, req.body.password);
  // res.send('it works!!') // to test 
  next();
};


// AUTOMATIC LOGIN WHEN REGISTER==> SEE authController


//                        LOGIN 
// ============================================================
// LOGIN FORM 
exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};




//                        UPDATE USER INFO
// ============================================================
// EDIT FORM  
exports.account = (req, res)  => {
res.render('account', {title: 'Edit Your Account'});
}; 

//UPDATE
exports.updateAccount = async (req, res)=> {
  const updates = {
    name: req.body.name, 
    email: req.body.email
  };

  const user = await User.findOneAndUpdate( 
    { _id: req.user._id }, // query
    { $set: updates },     // update
    { new: true, runValidators: true, context: 'query'} // options
  );
  req.flash('success', 'Your informations has been updated')
  res.redirect('/')
};
