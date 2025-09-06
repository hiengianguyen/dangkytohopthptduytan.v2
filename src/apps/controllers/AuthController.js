const { FirestoreModel, UserModel } = require("../models");
const { CollectionNameConstant } = require("../../constants");
const { capitalizeFirstLetter } = require("../../utils/capitalizeFirstLetter");
const e = require("express");

class AuthController {
  constructor() {
    this.userDbRef = new FirestoreModel(CollectionNameConstant.Users, UserModel);
    this.signIn = this.signIn.bind(this);
    this.signUp = this.signUp.bind(this);
  }

  async signIn(req, res, next) {
    const { phone, password } = req?.body;

    const existedUser = await this.userDbRef.getItemByFilter({
      phone: phone,
      password: password
    });

    if (existedUser) {
      res.cookie("isLogin", true, { maxAge: 604800000, httpOnly: true });
      res.cookie("userId", existedUser.id, { maxAge: 604800000, httpOnly: true });
      res.cookie("fullName", existedUser.fullName, { maxAge: 604800000, httpOnly: true });
      res.cookie("avatar", existedUser.avatar, { maxAge: 604800000, httpOnly: true });
      res.cookie("role", existedUser.role, { maxAge: 604800000, httpOnly: true });
      return res.json({
        user: {
          userId: existedUser.id,
          fullName: existedUser.fullName,
          avatar: existedUser.avatar,
          role: existedUser.role
        },
        isSuccess: true
      });
    } else {
      return res.json({
        messageError: "Số điện thoại hoặc mật khẩu không khớp",
        isSuccess: false
      });
    }
  }

  async signUp(req, res, next) {
    const { fullName, password, phone } = req?.body;
    const existedPhone = await this.userDbRef.getItemByFilter({ phone: phone });

    if (existedPhone) {
      return res.json({
        messageError: "Số điện thoại đã tồn tại trên hệ thống",
        isSuccess: false
      });
    } else {
      const userModel = new UserModel(undefined, capitalizeFirstLetter(fullName), password, phone, undefined, undefined, undefined);
      await this.userDbRef.addItem(userModel);
      return res.json({
        message: "Tạo tài khoản thành công",
        isSuccess: true
      });
    }
  }

  async signOut(req, res, next) {
    // save isLogin to cookie in 1 week
    res.cookie("isLogin", false, { maxAge: 604800000, httpOnly: true });
    return res.json({
      isSuccess: true,
      message: "Đăng xuất thành công"
    });
  }
}

module.exports = new AuthController();
