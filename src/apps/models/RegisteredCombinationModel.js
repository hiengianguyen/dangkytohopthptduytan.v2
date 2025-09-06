class RegisteredCombinationModel {
  constructor(data = {}) {
    this.id = data.id;
    this.numberMatriculation = data.numberMatriculation || "";
    this.fullName = data.fullName || "";
    this.gender = data.gender || "";
    this.dayOfBirth = data.dayOfBirth || "";
    this.placeOfBirth = data.placeOfBirth || "";
    this.nation = data.nation || "";
    this.village = data.village || "";
    this.commune = data.commune || "";
    this.city = data.city || "";
    this.identification = data.identification || "";
    this.identificationDay = data.identificationDay || "";
    this.identificationPlace = data.identificationPlace || "";
    this.phone = data.phone || "";
    this.nameDad = data.nameDad || "";
    this.jobDad = data.jobDad || "";
    this.phoneDad = data.phoneDad || "";
    this.nameMom = data.nameMom || "";
    this.jobMom = data.jobMom || "";
    this.phoneMom = data.phoneMom || "";
    this.secondarySchool = data.secondarySchool || "";
    this.secondarySchoolDistrict = data.secondarySchoolDistrict || "";
    this.avatar = data.avatar || "";
    this.aptitude = data.aptitude || "";
    this.aspirationSubject = data.aspirationSubject || "";
    this.goodSubject = data.goodSubject || "";
    this.goodSubjectDistrict = data.goodSubjectDistrict || "";
    this.goodSubjectProvince = data.goodSubjectProvince || "";
    this.avchielementLevel = data.avchielementLevel || "";
    this.avchielementGroup = data.avchielementGroup || "";
    this.mathPoint = data.mathPoint || "";
    this.literaturePoint = data.literaturePoint || "";
    this.englishPoint = data.englishPoint || "";
    this.conductPoint = data.conductPoint || "";
    this.admissionPoint = data.admissionPoint || "";
    this.combination1 = data.combination1 || "";
    this.combination2 = data.combination2 || "";
    this.sport = data.sport || "";
    this.priorityGroup = data.priorityGroup || "";
    this.difficultSituation = data.difficultSituation || "";
    this.height = data.height || "";
    this.weight = data.weight || "";
    this.disability = data.disability || "";
    this.sick = data.sick || [];
    this.typeStudent = data.typeStudent || [];
    this.isDeleted = data.isDeleted || false;
    this.status = data.status || "submitted";
    this.userId = data.userId || "";
    this.registeredAt = data.registeredAt || new Date();
  }

  fromFirestore(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    data.id = doc.id;
    return new RegisteredCombinationModel(data);
  }

  toFirestore() {
    return { ...this };
  }
}

module.exports = RegisteredCombinationModel;
