class ImageActivityModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.description = data.description || "";
    this.imgUrl = data.imgUrl || "";
    this.type = data.type || "";
    this.isDeleted = data.isDeleted || false;
  }

  fromFirestore(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    data.id = doc.id;
    return new ImageActivityModel(data);
  }

  toFirestore() {
    const obj = { ...this };
    delete obj.id;
    return obj;
  }
}

module.exports = ImageActivityModel;
