const passport = require('passport'); // for crypted passeword
const crypto = require('crypto'); // for crypted token 
const mongoose = require('mongoose'); // have access to database
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail'); // To send mail

//=====================================================================
//=====================================================================
//                           LOGIN 
// -------------------------------------------------------
// first we need to configure the passport authentificate in handlers
exports.login = passport.authenticate('local', { // coudl be authenticate('facebook')
    failureRedirect: '/login',
    failureFlash: 'Failed Login!',
    successRedirect: '/',
    successFlash: 'You are Loged in !'
});


//                         LOGOUT
// -------------------------------------------------------
exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out!');
    res.redirect('/');
};


//      PERMISSION TO ACCESS TO PAGE WHEN LOGGED or not
// -------------------------------------------------------
exports.isLoggedIn = (req, res, next) => {
    // Check if the user is authenticated
    if (req.isAuthenticated()) {
        next(); 
        return; 
    } 
    req.flash('error', 'Oops you must be logged in to to that!'); // else 
    res.redirect('/login');
};


//=====================================================================
//                  FORGOT PASSWORD / UPDATE PASSEWORD
//=====================================================================

//                      1 - SEND EXPIRED TOKEN 
// -------------------------------------------------------
exports.forgot = async (req, res) => {
    // 1 check if the email exist 
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
        req.flash('error', "The email doesn't exist");
        return res.redirect('/login');
    }

    // 2 set reset tokens and expiry on their account
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex'); // need to define resetPasswordToken in User Model
    user.resetPasswordExpires = Date.now() + 36000; // 1hour from now // need to define resetPasswordExpires in User Model
    await user.save(); 

    // 3 send a email with the token
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    req.flash('success', `You have been emailed a password reset link.`);
    
    await mail.send({
        user: user, // can be written user, car on se repette 
        subject: 'Password Reset',
        resetURL: resetURL, 
        filename: 'password-reset',
    })
    // 4 redirect to login page
    res.redirect('/login');
};


//                      2 - VERIFY THE TOKEN
// -------------------------------------------------------

exports.reset = async (req, res) => {
   // res.json(req.params); // to be sure there is the token
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() } //$gt is greatter than Now 
    });
    if (!user) {
        req.flash('error', 'Password resed is invalid or has been expired');
        return res.redirect('/login');
    };
    // if there is a user , show the reset the password form 
    //console.log(user)
    res.render('reset', { title: 'Reset your password'});
};


//            3- CHECK IF THE BOTH NEW PASSWORD MATCH 
// -------------------------------------------------------

exports.confirmedPasswords = (req, res, next) => {
    if (req.body.password === req.body.password_confirm) {
        next();
        return;
    }
    req.flash('error', 'Password do not match');
    res.redirect('back');
};

//                  4 - UPDATE PASSWORD 
// -------------------------------------------------------
exports.update = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() } //$gt is greatter than Now 
    });
    if (!user) {
        req.flash('error', 'Password resed is invalid or has been expired');
        return res.redirect('/login');
    };
    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordToken = undefined;  // on let mes à undifined car si succès et reset password on supprime ces deux bails
    user.resetPasswordExpires = undefined; 
    const updatedUser = await user.save();

    await req.login(updatedUser); // pour les automatic login // thanks to passport.js
    req.flash('success', 'Your password has been updated');
    res.redirect('/');
};

//=====================================================================
//=====================================================================