const {
  FirestoreModel,
  CombinationModel,
  NationModel,
  RegisteredCombinationModel,
  UserModel,
  SecondarySchoolModel,
  FavouriteSubmittedModel,
  UserNotificationModel
} = require("../models");
const { CollectionNameConstant } = require("../../constants");
const { convertToVietnameseDateTime } = require("../../utils/convertToVietnameseDateTime");
const { convertVietnameseDatetimeToDate } = require("../../utils/convertVietnameseDatetimeToDate");
const { uploadImageToCloudinary } = require("../../utils/uploadImageToCloudinary");
const { filterSubmittedList } = require("../../utils/filterSubmittedList");
const { checkCombinationAndCount } = require("../../utils/checkCombinationAndCount");

class CombinationController {
  constructor() {
    this.userDbRef = new FirestoreModel(CollectionNameConstant.Users, UserModel);
    this.nationDbRef = new FirestoreModel(CollectionNameConstant.Nations, NationModel);
    this.secondarySchoolDbRef = new FirestoreModel(CollectionNameConstant.SecondarySchools, SecondarySchoolModel);
    this.registeredCombinationsDbRef = new FirestoreModel(CollectionNameConstant.RegisteredCombinations, RegisteredCombinationModel);
    this.combinationDbRef = new FirestoreModel(CollectionNameConstant.Combinations, CombinationModel);
    this.favouriteSubmittedDbRef = new FirestoreModel(CollectionNameConstant.FavouriteSubmitted, FavouriteSubmittedModel);
    this.userNotificationDbRef = new FirestoreModel(CollectionNameConstant.UserNotification, UserNotificationModel);
    this.submited = this.submited.bind(this);
    this.submitedList = this.submitedList.bind(this);
    this.submitedDetail = this.submitedDetail.bind(this);
    this.submitCombination = this.submitCombination.bind(this);
    this.delete = this.delete.bind(this);
    this.saveDoc = this.saveDoc.bind(this);
    this.unsaveDoc = this.unsaveDoc.bind(this);
    this.savedSubmitted = this.savedSubmitted.bind(this);
    this.chart = this.chart.bind(this);
    this.table = this.table.bind(this);
    this.submitedApprove = this.submitedApprove.bind(this);
    this.submitedReject = this.submitedReject.bind(this);
    this.updateCombination = this.updateCombination.bind(this);
    this.submitedSort = this.submitedSort.bind(this);
  }

  async submited(req, res, next) {
    if (req?.cookies?.isLogin === "true") {
      const data = req?.body;
      if (data) {
        const [signatureParents, signatureStudent, avatar] = await Promise.all([
          uploadImageToCloudinary(data.signatureParents, "signatures"),
          uploadImageToCloudinary(data.signatureStudent, "signatures"),
          uploadImageToCloudinary(data.avatar, "users")
        ]);
        data.signatureParents = signatureParents.data;
        data.signatureStudent = signatureStudent.data;
        data.avatar = avatar.data;
        data.registeredAt = convertToVietnameseDateTime(new Date());
        const submitedCombinationModel = new RegisteredCombinationModel(data);
        const submitedByUserId = await this.registeredCombinationsDbRef.getItemByFilter({
          userId: data.userId
        });
        if (submitedByUserId) {
          await this.registeredCombinationsDbRef.updateItem(submitedByUserId.id, {...submitedCombinationModel.toFirestore(), isEdited: true});
          return res.json({
            message: "Cập nhật thông tin đăng ký vào lớp 10 thành công.",
            userId: data.userId
          });
        } else {
          await this.registeredCombinationsDbRef.addItem(submitedCombinationModel);
          return res.json({
            message: "Gửi thông tin đăng ký vào lớp 10 thành công.",
            userId: data.userId
          });
        }
      }
    } else {
      return res.redirect("/");
    }
  }

  async submitedList(req, res, next) {
    if (req?.cookies?.isLogin === "true") {
      const userId = req?.cookies?.userId;
      let [data, allIdDocSaved] = await Promise.all([
        this.registeredCombinationsDbRef.getAllItems(),
        this.favouriteSubmittedDbRef.getItemsByFilter({
          userId: userId
        })
      ]);

      data = data.sort((a, b) => {
        return convertVietnameseDatetimeToDate(a.registeredAt) - convertVietnameseDatetimeToDate(b.registeredAt);
      });
      allIdDocSaved = allIdDocSaved.map((docSaved) => docSaved.submittedId);

      Array.from(data).forEach((doc) => {
        if (allIdDocSaved.includes(doc.id)) {
          doc.favourite = true;
        } else {
          doc.favourite = false;
        }
      });

      return res.json({
        isSuccess: true,
        submitedList: data,
        isSavedPage: false
      });
    } else {
      return res.json({
        isSuccess: false,
        message: "Bạn chưa đăng nhập"
      });
    }
  }

  async submitedDetail(req, res, next) {
    if (req?.cookies?.isLogin === "true" && req?.params?.userId) {
      const userId = req?.params?.userId || req?.cookies?.userId;
      const data = await this.registeredCombinationsDbRef.getItemByFilter({
        userId: userId
      });

      const badge = {
        status: "",
        typeBadge: ""
      };

      switch (data?.status) {
        case "approved":
          badge.status = "Đã phê duyệt";
          badge.typeBadge = "success";
          break;
        case "rejected":
          badge.status = "Không phê duyệt";
          badge.typeBadge = "danger";
          break;
        default:
          badge.status = "Đã nộp";
          badge.typeBadge = "secondary";
          break;
      }

      return res.json({
        isSuccess: true,
        submitedCombinationDetail: data,
        showToast: req?.query?.toastmessage === "true",
        badge: badge
      });
    } else {
      return res.json({
        isSuccess: false,
        message: "Bạn chưa đăng nhập"
      });
    }
  }

  async submitCombination(req, res, next) {
    if (req?.cookies?.isLogin === "true" && req?.cookies?.userId) {
      const step = Number(req?.query?.step) || 1;
      let [docSubmited, secondarySchools, nations] = await Promise.all([
        this.registeredCombinationsDbRef.getItemByFilter({
          userId: req?.cookies?.userId
        }),
        this.secondarySchoolDbRef.getAllItems({
          fieldName: "order",
          type: "asc"
        }),
        this.nationDbRef.getAllItems()
      ]);

      //sort by name (asc)
      nations.sort((a, b) => (a.name > b.name ? 1 : -1));

      const districts = secondarySchools.map((doc) => {
        return {
          districtId: doc.districtId,
          districtName: doc.districtName
        };
      });

      return res.json({
        isSuccess: true,
        nations: nations,
        districts: districts,
        secondarySchools: secondarySchools,
        step: step,
        submitedDetail: docSubmited || false
      });
    } else {
      return res.json({
        isSuccess: false,
        message: "Hiện bạn chưa đăng nhập"
      });
    }
  }

  async delete(req, res, next) {
    const docId = req?.params?.id;
    await this.registeredCombinationsDbRef.softDeleteItem(docId);
    return res.redirect("back");
  }

  async saveDoc(req, res, next) {
    const docId = req?.body?.docId;
    const userId = req?.cookies?.userId;

    const docSubmitedSaved = await this.favouriteSubmittedDbRef.getItemByFilter({
      userId: userId,
      submittedId: docId
    });

    if (docSubmitedSaved) {
      await this.favouriteSubmittedDbRef.updateItem(docSubmitedSaved.id, { isDeleted: false });
    } else {
      const data = {
        userId: userId,
        submittedId: docId
      };
      const favouriteSubmittedModal = new FavouriteSubmittedModel(data);
      await this.favouriteSubmittedDbRef.addItem(favouriteSubmittedModal);
    }

    return res.json({
      message: "Lưu hồ sơ học sinh thành công"
    });
  }

  async unsaveDoc(req, res, next) {
    const docId = req?.body?.docId;
    const userId = req?.cookies?.userId;

    const docSubmitedSaved = await this.favouriteSubmittedDbRef.getItemByFilter({
      userId: userId,
      submittedId: docId
    });

    await this.favouriteSubmittedDbRef.softDeleteItem(docSubmitedSaved.id);
    return res.json({
      message: "Gỡ lưu hồ sơ học sinh thành công"
    });
  }

  async savedSubmitted(req, res, next) {
    const { userId } = req?.body;
    let allDocSubmittedSaved = await this.favouriteSubmittedDbRef.getItemsByFilter({
      userId: userId,
      isDeleted: false
    });

    if (allDocSubmittedSaved.length) {
      allDocSubmittedSaved = await Promise.all(
        allDocSubmittedSaved.map((docSaved) => this.registeredCombinationsDbRef.getItemById(docSaved.submittedId))
      );

      Array.from(allDocSubmittedSaved).forEach((doc) => {
        doc.favourite = true;
      });
    } else {
      allDocSubmittedSaved = [];
    }

    return res.json({
      isSuccess: true,
      submitedList: allDocSubmittedSaved,
      isSavedPage: true
    });
  }

  async chart(req, res, next) {
    if (req?.cookies?.isLogin === "true" && req?.cookies?.userId) {
      let length;
      const countCombinaton1 = [0, 0, 0, 0, 0, 0];
      const countCombinaton2 = [0, 0, 0, 0, 0, 0];
      let [data, combinations] = await Promise.all([this.registeredCombinationsDbRef.getAllItems(), this.combinationDbRef.getAllItems()]);
      length = data.length;
      combinations.sort((a, b) => (a.name > b.name ? 1 : -1));
      let classesCapacitys = combinations.map((combination) => combination.classesCapacity);
      combinations = combinations.map((combination) => combination.name);
      data.forEach((submit) => {
        const combinationNubber1 = submit.combination1.split(" ")[2];
        const combinationNubber2 = submit.combination2.split(" ")[2];
        checkCombinationAndCount(combinationNubber1, countCombinaton1);
        checkCombinationAndCount(combinationNubber2, countCombinaton2);
      });

      const mostChooseOfCombination1 = {};
      const mostChooseOfCombination2 = {};
      var max1 = 0;
      var max2 = 0;

      for (var i = 0; i < 6; i++) {
        if (max1 < countCombinaton1[i]) {
          max1 = countCombinaton1[i];
          mostChooseOfCombination1.count = max1;
          mostChooseOfCombination1.combination = `Tổ hợp ${i + 1}`;
        }

        if (max2 < countCombinaton2[i]) {
          max2 = countCombinaton2[i];
          mostChooseOfCombination2.count = max2;
          mostChooseOfCombination2.combination = `Tổ hợp ${i + 1}`;
        }
      }
      const classesCapacitysSubmitted = classesCapacitys.map((max, i) => max - countCombinaton1[i]);
      const submittedGoal = classesCapacitys.reduce((a, b) => a+b, 0);

      let submitted = [];
      let approved = [];
      let isEdited = [];
      let gender = [];
      let schoolCount = {};
      let otherSchool = 0;
      let pointCount = {
        '< 15': 0,
        '15-18': 0, 
        '18-21': 0, 
        '21-24': 0,
        '24-27': 0,
        '> 27': 0
      };
      let maxPoint = 0;
      let sumPoint = 0;

      for (const item of data) {
        if (item.status === 'submitted') submitted.push(item);
        if (item.status === 'approved') approved.push(item);
        if (item.isEdited) isEdited.push(item);
        if (item.gender === 'Nam') gender.push(item);
        const school = item.secondarySchool;
        if(!schoolCount[school]) schoolCount[school] = 0;
        schoolCount[school]++;
        const totalPoint = Number(item.mathPoint) + Number(item.literaturePoint) + Number(item.englishPoint);
        sumPoint += totalPoint;
        if(totalPoint < 15) {
          if(!pointCount['< 15']) pointCount['< 15'] = 0;
          pointCount['< 15']++;
        } else if(totalPoint >= 15 && totalPoint <=18) {
          if(!pointCount['15-18']) pointCount['15-18'] = 0;
          pointCount['15-18']++;
        } else if(totalPoint >= 18 && totalPoint <=21) {
          if(!pointCount['18-21']) pointCount['18-21'] = 0;
          pointCount['18-21']++;
        } else if(totalPoint >= 21 && totalPoint <=24) {
          if(!pointCount['21-24']) pointCount['21-24'] = 0;
          pointCount['21-24']++;
        } else if(totalPoint >= 24 && totalPoint <=27) {
          if(!pointCount['24-27']) pointCount['24-27'] = 0;
          pointCount['24-27']++;
        } else {
          if(!pointCount['> 27']) pointCount['> 27'] = 0;
          pointCount['> 27']++;
        }
      }   
      schoolCount = Object.entries(schoolCount).sort((a,b) => b[1] - a[1]).slice(0,4) || [];
      schoolCount.forEach((item) => otherSchool += item[1]);
      pointCount = Object.entries(pointCount);
      pointCount.forEach((item) => item[1] > maxPoint ? maxPoint = item[1] : maxPoint)

      return res.json({
        isSuccess: true,
        length: length,
        submittedGoal: submittedGoal,
        approvedLength: approved.length,
        submittedLength: submitted.length,
        isEdited: isEdited.length,
        maleGender: gender.length,
        schoolCount: schoolCount,
        otherSchool: length - otherSchool,
        pointCount: pointCount,
        maxPoint: maxPoint,
        avgPoint: (sumPoint/length).toFixed(1),
        countCombinaton1: countCombinaton1,
        countCombinaton2: countCombinaton2,
        classesCapacitys: classesCapacitysSubmitted,
        mostChooseOfCombination1: mostChooseOfCombination1,
        mostChooseOfCombination2: mostChooseOfCombination2,
        combinations: combinations
      });
    } else {
      return res.json({
        isSuccess: false,
        message: "Bạn chưa đăng nhập"
      });
    }
  }

  async table(req, res, next) {
    if (req?.cookies?.isLogin === "true" && req?.cookies?.userId) {
      const combinations = await this.combinationDbRef.getAllItems();
      combinations.sort((a, b) => (a.name > b.name ? 1 : -1));
      return res.json({
        isSuccess: true,
        combinations: combinations
      });
    } else {
      return res.json({ isSuccess: false });
    }
  }

  async updateCombination(req, res, next) {
    const combinationId = req?.params?.id;
    const data = req?.body;

    data.classesCapacity = data.classesCount * 40;

    const ok = await this.combinationDbRef.updateItem(combinationId, data);
    if (ok) {
      return res.json({
        isSuccess: true,
        docAfter: { ...ok, id: combinationId },
        message: "Cập nhật thông tin tổ hợp thành công"
      });
    } else {
      return res.json({
        isSuccess: false,
        message: "Cập nhật thông tin tổ hợp không thành công"
      });
    }
  }

  async submitedApprove(req, res, next) {
    const userId = req.params.id;
    const currTime = new Date();
    const docSubmited = await this.registeredCombinationsDbRef.getItemByFilter({
      userId: userId
    });
    const data = {
      userId: userId,
      notificationId: "omtURp0ycFYGKXDx5Mgm",
      publishAt: convertToVietnameseDateTime(currTime)
    };
    const userNotificationModel = new UserNotificationModel(data);
    const submittedId = docSubmited.id;

    await Promise.all([
      this.registeredCombinationsDbRef.updateItem(submittedId, {
        status: "approved"
      }),
      this.userNotificationDbRef.addItem(userNotificationModel)
    ]);

    return res.json({
      isSuccess: true,
      message: "Phê duyệt hồ sơ thành công!"
    });
  }

  async submitedReject(req, res, next) {
    const userId = req.params.id;
    const currTime = new Date();
    const docSubmited = await this.registeredCombinationsDbRef.getItemByFilter({
      userId: userId
    });
    const userNotificationModel = new UserNotificationModel(
      null, //id
      userId,
      "6iVi02UXYo1Ad5uIYftv",
      convertToVietnameseDateTime(currTime),
      null //isDeleted
    );
    const submittedId = docSubmited.id;
    await Promise.all([
      this.registeredCombinationsDbRef.updateItem(submittedId, {
        status: "rejected"
      }),
      this.userNotificationDbRef.addItem(userNotificationModel)
    ]);

    return res.json({
      isSuccess: true,
      message: "Huỷ phê duyệt hồ sơ thành công!"
    });
  }

  async submitedSort(req, res, next) {
    const { submittedList, statusCheck, ...filter } = req.body;
    const finalData = filterSubmittedList(submittedList, filter, statusCheck);

    return res.json({
      isSuccess: true,
      submittedListAfterSort: finalData,
      filter: filter
    });
  }
}

module.exports = new CombinationController();
