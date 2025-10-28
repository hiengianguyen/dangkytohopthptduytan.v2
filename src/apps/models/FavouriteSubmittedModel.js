class FavouriteSubmittedModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || "";
    this.submittedId = data.submittedId || "";
    this.isDeleted = data.isDeleted || false;
  }

  fromFirestore(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    data.id = doc.id;
    return new FavouriteSubmittedModel(data);
  }

  toFirestore() {
    const obj = { ...this };
    delete obj.id;
    return obj;
  }
}

module.exports = FavouriteSubmittedModel;
