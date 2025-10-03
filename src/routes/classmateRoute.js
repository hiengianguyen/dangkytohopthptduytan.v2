const { ClassmateController } = require("../apps/controllers/index");
const express = require("express");
const router = express.Router();

router.get("/students", ClassmateController.studentList);
router.get("/classes", ClassmateController.classes);
router.get("/class/:id", ClassmateController.classDetail);
router.post("/classes/create", ClassmateController.createClass);
router.post("/student/sort", ClassmateController.studentSort);
router.post("/classes/delete", ClassmateController.deleteClass);
router.post("/classes/update/:id", ClassmateController.updateClass);
router.post("/student/add/class", ClassmateController.studentAddClass);

module.exports = router;
