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
        const avatar = await uploadImageToCloudinary(data.avatar, "users");
        data.avatar = avatar.data;
        data.registeredAt = convertToVietnameseDateTime(new Date());
        const submitedCombinationModel = new RegisteredCombinationModel(data);
        const submitedByUserId = await this.registeredCombinationsDbRef.getItemByFilter({
          userId: data.userId
        });
        if (submitedByUserId) {
          await this.registeredCombinationsDbRef.updateItem(submitedByUserId.id, submitedCombinationModel.toFirestore());
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
      const userId = req?.params?.userId;
      const data = await this.registeredCombinationsDbRef.getItemByFilter({
        userId: userId
      });

      const badge = {
        status: "",
        typeBadge: ""
      };

      switch (data.status) {
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
      const favouriteSubmittedModal = new FavouriteSubmittedModel(undefined, userId, docId, undefined);
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

    if (allDocSubmittedSaved) {
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
      function checkCombinationAndCount(combinationNumber, arr) {
        switch (combinationNumber) {
          case "1":
            arr[0] = arr[0] + 1;
            break;
          case "2":
            arr[1] = arr[1] + 1;
            break;
          case "3":
            arr[2] = arr[2] + 1;
            break;
          case "4":
            arr[3] = arr[3] + 1;
            break;
          case "5":
            arr[4] = arr[4] + 1;
            break;
          case "6":
            arr[5] = arr[5] + 1;
            break;
        }
      }

      const countCombinaton1 = [0, 0, 0, 0, 0, 0];
      const countCombinaton2 = [0, 0, 0, 0, 0, 0];
      let [data, combinations] = await Promise.all([this.registeredCombinationsDbRef.getAllItems(), this.combinationDbRef.getAllItems()]);
      combinations.sort((a, b) => (a.name > b.name ? 1 : -1));
      let classesCapacitys = combinations.map((combination) => combination.classesCapacity);
      combinations = combinations.map((combination) => combination.name);
      data = data.forEach((submit) => {
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

      const combinationsInfo = combinations.map((combinationName, index) => {
        return {
          name: combinationName,
          countCombinaton1: countCombinaton1[index],
          countCombinaton2: countCombinaton2[index]
        };
      });

      classesCapacitys = classesCapacitys.map((max, i) => max - countCombinaton1[i]);

      return res.json({
        isSuccess: true,
        countCombinaton1: countCombinaton1,
        countCombinaton2: countCombinaton2,
        classesCapacitys: classesCapacitys,
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
    const userId = req.body.userId;
    const currTime = new Date();
    const docSubmited = await this.registeredCombinationsDbRef.getItemByFilter({
      userId: userId
    });
    const userNotificationModel = new UserNotificationModel(
      null, //id
      userId,
      "omtURp0ycFYGKXDx5Mgm",
      convertToVietnameseDateTime(currTime),
      null //isDeleted
    );
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
    const userId = req.body.userId;
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
    const { submittedList, ...filter } = req.body;
    const finalData = filterSubmittedList(submittedList, filter);

    return res.json({
      isSuccess: true,
      submittedListAfterSort: finalData
    });
  }
}

module.exports = new CombinationController();
