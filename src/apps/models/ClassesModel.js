class ClassesModel {
  constructor(id, name, teacher, combination1, combination2, isDeleted) {
    this.id = id;
    this.name = name;
    this.teacher = teacher;
    this.combination1 = combination1;
    this.combination2 = combination2;
    this.isDeleted = isDeleted || false;
  }

  fromFirestore(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    return new ClassesModel(doc.id, data.name, data.teacher, data.combination1, data.combination2, data.isDeleted);
  }

  toFirestore() {
    return {
      name: this.name,
      teacher: this.teacher,
      combination1: this.combination1,
      combination2: this.combination2,
      isDeleted: this.isDeleted
    };
  }
}

module.exports = ClassesModel;
