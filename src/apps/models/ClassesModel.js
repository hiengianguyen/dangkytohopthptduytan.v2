class ClassesModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.teacher = data.teacher || "";
    this.combination1 = data.combination1 || "";
    this.combination2 = data.combination2 || "";
    this.isDeleted = data.isDeleted || false;
  }

  fromFirestore(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    data.id = doc.id;
    return new ClassesModel(data);
  }

  toFirestore() {
    const obj = { ...this };
    delete obj.id;
    return obj;
  }
}

module.exports = ClassesModel;
