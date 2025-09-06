const { FirestoreModel, ImageActivityModel } = require("../models");
const { CollectionNameConstant } = require("../../constants");

class SchoolController {
  constructor() {
    this.imageActivityDbRef = new FirestoreModel(CollectionNameConstant.ImageActivity, ImageActivityModel);
    this.index = this.index.bind(this);
  }

  async index(req, res, next) {
    let [imgStudentDancings, imgStudentCampings, imgStudentActivitys, imgStudentAchievements, imgSchool] = await Promise.all([
      this.imageActivityDbRef.getItemsByFilter({
        type: "dance"
      }),
      this.imageActivityDbRef.getItemsByFilter({
        type: "camp"
      }),
      this.imageActivityDbRef.getItemsByFilter({
        type: "activity"
      }),
      this.imageActivityDbRef.getItemsByFilter({
        type: "achievement"
      }),
      this.imageActivityDbRef.getItemsByFilter({
        type: "school"
      })
    ]);

    const studentAchievementsSorted = imgStudentAchievements.sort((a, b) => {
      const stringNumberFirstA = a.imgUrl.split("cap_tinh_")[1];
      const stringNumberFirstB = b.imgUrl.split("cap_tinh_")[1];

      return parseInt(stringNumberFirstA) - parseInt(stringNumberFirstB);
    });

    return res.json({
      studentAchievements: studentAchievementsSorted,
      imgStudentDancings: imgStudentDancings,
      imgStudentCampings: imgStudentCampings,
      imgSchool: imgSchool,
      imgStudentActivitys: imgStudentActivitys
    });
  }
}

module.exports = new SchoolController();
