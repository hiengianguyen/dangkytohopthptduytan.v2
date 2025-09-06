const { NotificationController } = require("../apps/controllers/index");
const express = require("express");
const router = express.Router();

router.get("/", NotificationController.index);
router.get("/edit/:id", NotificationController.notiEdit);
router.post("/create-noti", NotificationController.createNoti);
router.post("/update-noti/:id", NotificationController.updateNoti);
router.get("/detail/:id", NotificationController.notiDetail);
router.get("/delete/:id", NotificationController.userNotiDelete);
router.get("/delete/m/:id", NotificationController.notiDelete);

module.exports = router;
