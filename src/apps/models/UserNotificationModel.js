class UserNotificationModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || "";
    this.notificationId = data.notificationId || "";
    this.publishAt = data.publishAt;
    this.isDeleted = data.isDeleted || false;
  }

  fromFirestore(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    data.id = doc.id;
    return new UserNotificationModel(data);
  }

  toFirestore() {
    const obj = { ...this };
    delete obj.id;
    return obj;
  }
}

module.exports = UserNotificationModel;
