const { MeController } = require("../apps/controllers/index");
const express = require("express");
const router = express.Router();

router.get("/profile", MeController.index);
router.post("/profile/update", MeController.update);

module.exports = router;
