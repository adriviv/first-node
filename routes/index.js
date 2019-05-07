const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers');

// All the routes
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore));
router.get('/stores/:id/edit', catchErrors(storeController.editStore))
router.post('/add/:id', catchErrors(storeController.updateStore));


// For static page can be done here: ((about is the view))
// router.get('/', (req, res) => {res.render('about')})

module.exports = router;
