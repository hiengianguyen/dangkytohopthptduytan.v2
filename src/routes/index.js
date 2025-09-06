const express = require("express");
const router = express.Router();

const homeRouter = require("./homeRoute");
const authRouter = require("./authRoute");
const meRouter = require("./meRoute");
const schoolRouter = require("./schoolRoute");
const combinationRouter = require("./combinationRoute");
const fileRouter = require("./fileRoute");
const notiRouter = require("./notiRoute");

router.use("/", homeRouter);
router.use("/me", meRouter);
router.use("/notification", notiRouter);
router.use("/auth", authRouter);
router.use("/combination", combinationRouter);
router.use("/school", schoolRouter);
router.use("/file", fileRouter);
router.get("/healthz", (req, res, next) => res.sendStatus(200));

module.exports = router;
