const { FirestoreModel, NotificationModel, UserNotificationModel } = require("../models");
const { CollectionNameConstant } = require("../../constants");
const { convertToVietnameseDateTime } = require("../../utils/convertToVietnameseDateTime");

class NotificationController {
  constructor() {
    this.notiDBRef = new FirestoreModel(CollectionNameConstant.Notification, NotificationModel);
    this.userNotificationDbRef = new FirestoreModel(CollectionNameConstant.UserNotification, UserNotificationModel);
    this.index = this.index.bind(this);
    this.notiDetail = this.notiDetail.bind(this);
    this.notiDelete = this.notiDelete.bind(this);
    this.createNoti = this.createNoti.bind(this);
    this.notiEdit = this.notiEdit.bind(this);
    this.updateNoti = this.updateNoti.bind(this);
  }

  async index(req, res, next) {
    if (req?.cookies?.isLogin === "true") {
      const userId = req?.cookies?.userId;
      let [notifications, notiSubmittedStatus] = await Promise.all([
        this.notiDBRef.getAllItems({
          fieldName: "publishAt",
          type: "desc"
        }),
        this.userNotificationDbRef.getItemByFilter({ userId: userId })
      ]);
      const publishAt = notiSubmittedStatus?.publishAt;

      notiSubmittedStatus = await this.notiDBRef.getItemById(notiSubmittedStatus?.notificationId || "");
      if (notiSubmittedStatus) {
        notiSubmittedStatus.publishAt = publishAt;
      }

      return res.json({
        isSuccess: true,
        notiSubmittedStatus: notiSubmittedStatus,
        notifications: [...notifications],
        role: req?.cookies?.role
      });
    } else {
      return res.json({
        isSuccess: false,
        message: "Bạn chưa đăng nhập"
      });
    }
  }

  async notiEdit(req, res, next) {
    if (req?.cookies?.isLogin === "true") {
      const notiId = req?.params?.id;
      const notification = await this.notiDBRef.getItemById(notiId);

      return res.json({
        isSuccess: true,
        notification: notification
      });
    } else {
      return res.json({
        isSuccess: true,
        message: "Bạn chưa đăng nhập"
      });
    }
  }

  async notiDetail(req, res, next) {
    if (req?.cookies?.isLogin === "true") {
      const notiId = req?.params?.id;
      const notification = await this.notiDBRef.getItemById(notiId);

      return res.json({
        isSuccess: true,
        notification: notification
      });
    } else {
      return res.json({
        isSuccess: false,
        message: "Bạn chưa đăng nhập"
      });
    }
  }

  async notiDelete(req, res, next) {
    if (req?.cookies?.isLogin === "true") {
      const notiId = req?.params?.id;
      const result = await this.notiDBRef.hardDeleteItem(notiId);
      if (result) {
        return res.json({
          message: "Xoá thông báo thành công.",
          isSuccess: true
        });
      } else {
        return res.json({
          message: "Xoá thông báo không thành công.",
          isSuccess: false
        });
      }
    } else {
      return res.json({
        message: "Bạn chưa đăng nhập",
        isSuccess: false,
        type: "auth"
      });
    }
  }

  async createNoti(req, res, next) {
    const { title = null, message = null, fileUrl = null, type = "text" } = req.body;
    let typeNoti = type;
    if (fileUrl) {
      typeNoti = "file";
    }
    const currentTime = new Date();
    const data = {
      title: title,
      message: message,
      fileUrl: fileUrl,
      type: type,
      publishAt: convertToVietnameseDateTime(currentTime)
    };
    const notificationModel = new NotificationModel(data);

    const response = await this.notiDBRef.addItem(notificationModel);
    if (response) {
      return res.json({
        message: "Gữi thông báo thành công",
        isSuccess: true
      });
    } else {
      return res.json({
        message: "Gữi thông báo không thành công",
        isSuccess: false
      });
    }
  }

  async updateNoti(req, res, next) {
    const id = req?.params?.id;
    const { title = null, message = null, fileUrl = null, type = "text" } = req.body;

    let typeNoti = type;
    if (fileUrl) {
      typeNoti = "file";
    }

    const currentTime = new Date();
    const response = await this.notiDBRef.updateItem(id, {
      title: title,
      message: message,
      fileUrl: fileUrl,
      type: typeNoti,
      publishAt: convertToVietnameseDateTime(currentTime)
    });
    if (response) {
      return res.json({
        message: "Cập nhật thông báo thành công",
        id: id,
        isSuccess: true
      });
    } else {
      return res.json({
        message: "Cập nhật thông báo không thành công",
        isSuccess: false
      });
    }
  }
}

module.exports = new NotificationController();
