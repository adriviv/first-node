const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers');

// All the routes
router.get('/', storeController.homePage);
router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore));

// For static page can be done here: 
// ==> router.get('/', (req, res) => {
//     res.render('index');
// })

module.exports = router;
