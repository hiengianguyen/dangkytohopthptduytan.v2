class SecondarySchoolModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.districtId = data.districtId || "";
    this.districtName = data.districtName || "";
    this.schools = data.schools || [];
    this.order = data.order || 0;
    this.isDeleted = data.isDeleted || false;
  }

  fromFirestore(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    data.id = doc.id;
    return new SecondarySchoolModel(data);
  }

  toFirestore() {
    const obj = { ...this };
    delete obj.id;
    return obj;
  }
}

module.exports = SecondarySchoolModel;
