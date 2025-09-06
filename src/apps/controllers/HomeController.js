const { FirestoreModel, ImageActivityModel } = require("../models");
const { CollectionNameConstant } = require("../../constants");

class HomeController {
  constructor() {
    this.imageActivityDbRef = new FirestoreModel(CollectionNameConstant.ImageActivity, ImageActivityModel);
    this.homePage = this.homePage.bind(this);
  }

  async homePage(req, res, next) {
    if (req?.cookies?.isLogin === "true") {
      if (req?.cookies?.role === "manager") {
        return res.json({
          isSuccess: false,
          message: "Bạn đã đăng nhập rồi",
          redirect: "/combination/submitted/list"
        });
      } else {
        return res.json({
          isSuccess: false,
          message: "Bạn đã đăng nhập rồi",
          redirect: "/combination/register"
        });
      }
    } else {
      const studentAchievements = await this.imageActivityDbRef.getItemsByFilter({
        type: "achievement"
      });
      const studentAchievementsSorted = studentAchievements.sort((a, b) => {
        const stringNumberFirstA = a.imgUrl.split("cap_tinh_")[1];
        const stringNumberFirstB = b.imgUrl.split("cap_tinh_")[1];

        return parseInt(stringNumberFirstA) - parseInt(stringNumberFirstB);
      });
      return res.json({
        isSuccess: true,
        studentAchievements: studentAchievementsSorted
      });
    }
  }
}

module.exports = new HomeController();
