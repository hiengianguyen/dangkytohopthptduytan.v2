const { CombinationController } = require("../apps/controllers/index");
const express = require("express");
const router = express.Router();

router.post("/submited", CombinationController.submited);
router.post("/save", CombinationController.saveDoc);
router.post("/unsave", CombinationController.unsaveDoc);
router.get("/analytics", CombinationController.chart);
router.get("/table", CombinationController.table);
router.post("/update/:id", CombinationController.updateCombination);
router.get("/submited-list", CombinationController.submitedList);
router.post("/submited/sort", CombinationController.submitedSort);
router.post("/submited-list/saved", CombinationController.savedSubmitted);
router.get("/submit-combination", CombinationController.submitCombination);
router.get("/delete/submited-combination/:id", CombinationController.delete);
router.get("/submited-detail/:userId", CombinationController.submitedDetail);
router.post("/submited-approve/:id", CombinationController.submitedApprove);
router.post("/submited-reject/:id", CombinationController.submitedReject);

module.exports = router;
