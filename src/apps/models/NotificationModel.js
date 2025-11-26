class NotificationModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || "";
    this.subTitle = data.subTitle || "";
    this.message = data.message || "";
    this.fileUrl = data.fileUrl || "";
    this.type = data.type || "text";
    this.registeredBy = data.registeredBy || "Admin hệ thống";
    this.typeNoti = data.typeNoti || "Tuyển sinh";
    this.publishAt = data.publishAt;
    this.isDeleted = data.isDeleted || false;
  }

  fromFirestore(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    data.id = doc.id;
    return new NotificationModel(data);
  }

  toFirestore() {
    const obj = { ...this };
    delete obj.id;
    return obj;
  }
}

module.exports = NotificationModel;
