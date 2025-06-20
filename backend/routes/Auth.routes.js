const express = require('express');
const router = express.Router();
const authController = require('../controllers/Auth.controller');
const requireUser = require('../middlewares/requiredUser');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', requireUser,authController.logout);
router.post('/logout-all', requireUser, authController.logoutAll);
module.exports = router;
