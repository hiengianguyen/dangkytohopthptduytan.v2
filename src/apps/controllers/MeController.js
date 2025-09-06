const { FirestoreModel, UserModel, SecondarySchoolModel } = require("../models");
const { CollectionNameConstant } = require("../../constants");
const { capitalizeFirstLetter } = require("../../utils/capitalizeFirstLetter");
const { uploadImageToCloudinary } = require("../../utils/uploadImageToCloudinary");

class MeController {
  constructor() {
    this.userDbRef = new FirestoreModel(CollectionNameConstant.Users, UserModel);
    this.secondarySchoolDbRef = new FirestoreModel(CollectionNameConstant.SecondarySchools, SecondarySchoolModel);
    this.index = this.index.bind(this);
    this.update = this.update.bind(this);
  }

  async index(req, res, next) {
    if (req?.cookies?.isLogin === "true" && req?.cookies?.userId) {
      const user = await this.userDbRef.getItemById(req?.cookies?.userId);
      return res.json({
        showToast: req?.query?.toastmessage === "true",
        user: user,
        isSuccess: true
      });
    } else {
      return res.json({
        isSuccess: false,
        message: "Hiện bạn chưa đăng nhập"
      });
    }
  }

  async update(req, res, next) {
    if (req?.cookies?.isLogin === "true" && req?.cookies?.userId) {
      const { fullName, phone, avatar } = req?.body;
      let formData = {
        fullName: capitalizeFirstLetter(fullName),
        phone: phone
      };

      if (avatar && avatar != "") {
        const avatarResult = await uploadImageToCloudinary(avatar, "avatars");
        formData.avatar = avatarResult.data;
      }

      try {
        await this.userDbRef.updateItem(req?.cookies?.userId, formData);
        const userAfterUpdate = await this.userDbRef.getItemById(req?.cookies?.userId);
        return res.json({
          message: "Cập nhật trang cá nhân thành công",
          type: "success",
          icon: "✅",
          isSuccess: true,
          auth: {
            user: userAfterUpdate,
            isisAuthenticated: true
          }
        });
      } catch {
        return res.json({
          message: "Lỗi khi cập nhật trang cá nhân",
          type: "error",
          icon: "❌",
          isSuccess: false
        });
      }
    } else {
      return res.json({
        isSuccess: false,
        message: "Hiện bạn chưa đăng nhập"
      });
    }
  }
}

module.exports = new MeController();
