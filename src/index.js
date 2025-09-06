const path = require("path");
const route = require("./routes");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

require("dotenv").config();
const port = process.env.PORT || 4001;

// Tăng giới hạn cho JSON body
app.use(express.json({ limit: "50mb" }));

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api", route);

// Static file
app.use(express.static(path.join(__dirname, "utils")));

app.use(express.static(path.join(__dirname, "build")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => console.log(`App is listening at port ${port}`));
