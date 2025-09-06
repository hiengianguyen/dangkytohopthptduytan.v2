const { AuthController } = require("../apps/controllers/index");
const express = require("express");
const router = express.Router();

router.post("/signin", AuthController.signIn);
router.post("/signup", AuthController.signUp);
router.get("/signout", AuthController.signOut);

module.exports = router;
