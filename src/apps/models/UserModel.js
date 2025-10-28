const { UserConstant } = require("../../constants");

class UserModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.fullName = data.fullName || "";
    this.password = data.password || "";
    this.phone = data.phone || "";
    this.avatar = data.avatar || UserConstant.DefaultAvatarUrl;
    this.role = data.role || "student";
    this.isDeleted = data.isDeleted || false;
  }

  fromFirestore(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    data.id = doc.id;
    return new UserModel(data);
  }

  toFirestore() {
    const obj = { ...this };
    delete obj.id;
    return obj;
  }
}

module.exports = UserModel;
