const express = require('express');
const router = express.Router();
const { catchErrors } = require('../handlers/errorHandlers');


// DON'T FORGET TO IMPORT YOUR CONTROLLERS
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// =============================================================
//                          STORE CONTROLLER 
// =============================================================
// INDEX
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));

// SHOW 
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));


// ADD 
router.get('/add', authController.isLoggedIn, storeController.addStore);

// CREATE 
router.post('/add', 
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.createStore)
);

// EDIT 
router.get('/stores/:id/edit', catchErrors(storeController.editStore));

// UPDATE
router.post('/add/:id', 
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.updateStore)
);


// ===============================================================
//                       TAGS in STORE CONTROLLER 
// ===============================================================
// INDEX + SHOW 
router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));


// ================================================================
//                   LOGIN / REGISTER / LOGOUT
// ================================================================
// LOGIN  = userController + authController
 router.get('/login', userController.loginForm); 
 router.post('/login', authController.login);

// REGISTRER = userController + authController
router.get('/register', userController.registerForm); // 1-  create a register Form 

router.post('/register',
 userController.validateRegister, // 2- Check & validates all the form data
 userController.register,        // 3 - registrer the user 
 authController.login           // 4- automatic login the user 
 ); 


//LOG OUT = authController
router.get('/logout', authController.logout);

// ===============================================================
//                          EDIT USER INFO
// ===============================================================
// EDIT  
router.get('/account', authController.isLoggedIn,  userController.account);
router.post('/account', catchErrors(userController.updateAccount));


// ===============================================================
//                           FORGOT EMAIL 
// ===============================================================
// CHECK IF THE EMAIL EXIST 
router.post('/account/forgot', catchErrors(authController.forgot))

//SEND TOKEN and redirect to reset form
router.get('/account/reset/:token', catchErrors(authController.reset));

// UPDATE PASSWORD
router.post('/account/reset/:token', 
    authController.confirmedPasswords, // confirmed if both password are the same
    catchErrors(authController.update) // update paswword
);

module.exports = router;
