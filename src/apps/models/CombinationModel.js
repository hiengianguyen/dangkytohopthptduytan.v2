class CombinationModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.description = data.description || "";
    this.classesCount = data.classesCount || 0;
    this.classesCapacity = data.classesCapacity || 0;
    this.compulsorySubjects = data.compulsorySubjects || [];
    this.optionalSubjects = data.optionalSubjects || [];
    this.isDeleted = data.isDeleted || false;
  }

  fromFirestore(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    data.id = doc.id;
    return new CombinationModel(data);
  }

  toFirestore() {
    const obj = { ...this };
    delete obj.id;
    return obj;
  }
}

module.exports = CombinationModel;
