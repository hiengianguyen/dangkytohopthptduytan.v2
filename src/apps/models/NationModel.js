class NationModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.isDeleted = data.isDeleted || false;
  }

  fromFirestore(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    data.id = doc.id;
    return new NationModel(data);
  }

  toFirestore() {
    const obj = { ...this };
    delete obj.id;
    return obj;
  }
}

module.exports = NationModel;
