const homeRouter = require("./homeRoute");
const authRouter = require("./authRoute");
const meRouter = require("./meRoute");
const schoolRouter = require("./schoolRoute");
const combinationRouter = require("./combinationRoute");
const fileRouter = require("./fileRoute");
const classmateRoute = require("./classmateRoute");
const notiRouter = require("./notiRoute");

function routes(app) {
  app.use("/", homeRouter);
  app.use("/me", meRouter);
  app.use("/notification", notiRouter);
  app.use("/auth", authRouter);
  app.use("/combination", combinationRouter);
  app.use("/school", schoolRouter);
  app.use("/file", fileRouter);
  app.use("/ad", classmateRoute);
  app.get("/healthz", (req, res, next) => res.sendStatus(200));
}

module.exports = routes;
