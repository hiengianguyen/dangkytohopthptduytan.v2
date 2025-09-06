const { FirestoreModel, RegisteredCombinationModel, UserModel } = require("../models");
const { CollectionNameConstant } = require("../../constants");
const { generateJWT } = require("../../utils/generateJWT");
const { exportExcelFile } = require("../../utils/exportFile");
const http = require("https");
require("dotenv").config();

class FileController {
  constructor() {
    this.userDBRef = new FirestoreModel(CollectionNameConstant.Users, UserModel);
    this.registeredCombinationsDbRef = new FirestoreModel(CollectionNameConstant.RegisteredCombinations, RegisteredCombinationModel);
    this.exportSubmitedListExcel = this.exportSubmitedListExcel.bind(this);
    this.exportSubmitedListFilterExcel = this.exportSubmitedListFilterExcel.bind(this);
    this.exportSubmitedPDF = this.exportSubmitedPDF.bind(this);
  }

  async exportSubmitedListExcel(req, res, next) {
    let submitedList = await this.registeredCombinationsDbRef.getAllItems({
      fieldName: "registeredAt",
      type: "asc"
    });
    submitedList = await Promise.all(
      submitedList.map(async (doc) => {
        let phoneNumber;
        if (doc.userId) {
          const userSubmited = await this.userDBRef.getItemById(doc.userId);
          phoneNumber = userSubmited.phone || "";
        }
        return {
          ...doc,
          phoneNumber: phoneNumber
        };
      })
    );

    const keys = [
      "STT",
      "Họ tên học sinh",
      "Giới tính",
      "Ngày tháng năm sinh",
      "Trường học cấp 2",
      "Nguyện vọng 1",
      "Nguyện vọng 2",
      "Điểm Toán",
      "Điểm Văn",
      "Điểm Anh",
      "Ngày đăng ký",
      "Họ và tên cha",
      "SĐT cha",
      "Họ và tên mẹ",
      "SĐT mẹ",
      "SĐT đăng ký"
    ];
    const rows = submitedList.map((row, index) => {
      return {
        index: index + 1,
        fullName: row.fullName,
        gender: row.gender,
        dayOfBirth: row.dayOfBirth,
        secondarySchool: row.secondarySchool + ", " + (row.secondarySchoolDistrict || "") + ", " + "TP. Đà Nẵng",
        combination1: row.combination1,
        combination2: row.combination2,
        mathPoint: row.mathPoint,
        literaturePoint: row.literaturePoint,
        englishPoint: row.englishPoint,
        registeredAt: row.registeredAt,
        fullNameDad: row.nameDad,
        phoneOfDad: row.phoneDad,
        fullNameMom: row.nameMom,
        phoneOfMom: row.phoneMom,
        phoneNumber: row.phone
      };
    });
    const buffer = exportExcelFile(rows, keys);

    res.setHeader("Content-Disposition", "attachment; filename=DanhSachDangKy.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.send(buffer);
  }

  async exportSubmitedListFilterExcel(req, res, next) {
    const { submittedList } = req?.body;

    const keys = [
      "STT",
      "Họ tên học sinh",
      "Giới tính",
      "Ngày tháng năm sinh",
      "Trường học cấp 2",
      "Nguyện vọng 1",
      "Nguyện vọng 2",
      "Điểm Toán",
      "Điểm Văn",
      "Điểm Anh",
      "Ngày đăng ký",
      "Họ và tên cha",
      "SĐT cha",
      "Họ và tên mẹ",
      "SĐT mẹ",
      "SĐT đăng ký"
    ];

    const rows = submittedList.map((row, index) => {
      return {
        index: index + 1,
        fullName: row.fullName,
        gender: row.gender,
        dayOfBirth: row.dayOfBirth,
        secondarySchool: row.secondarySchool + ", " + (row.secondarySchoolDistrict || "") + ", " + "TP. Đà Nẵng",
        combination1: row.combination1,
        combination2: row.combination2,
        mathPoint: row.mathPoint,
        literaturePoint: row.literaturePoint,
        englishPoint: row.englishPoint,
        registeredAt: row.registeredAt,
        fullNameDad: row.nameDad,
        phoneOfDad: row.phoneDad,
        fullNameMom: row.nameMom,
        phoneOfMom: row.phoneMom,
        phoneNumber: row.phone
      };
    });
    const buffer = exportExcelFile(rows, keys);
    return res.send(buffer);
  }

  async exportSubmitedPDF(req, res, next) {
    const userId = req?.params?.userId ?? req?.cookies?.userId;
    const data = await this.registeredCombinationsDbRef.getItemByFilter({
      userId: userId
    });

    const registeredAt = data.registeredAt;
    const registeredDay = registeredAt.split(" ")[1];
    const [day, month, year] = registeredDay.split("/");
    data.registeredDay = day;
    data.registeredMonth = month;
    data.registeredYear = year;

    const options = {
      method: "POST",
      hostname: "us1.pdfgeneratorapi.com",
      port: null,
      path: "/api/v4/documents/generate",
      headers: {
        Authorization: `Bearer ${generateJWT(process.env.GENERATOR_PDF_API_KEY, process.env.GENERATOR_PDF_API_SECRET, process.env.EMAIL)}`,
        "Content-Type": "application/json"
      }
    };

    let PDFUrl;
    const require = http.request(options, function (response) {
      const chunks = [];

      response.on("data", function (chunk) {
        chunks.push(chunk);
      });

      response.on("end", function () {
        const body = Buffer.concat(chunks);
        PDFUrl = JSON.parse(body.toString()).response;

        if (!PDFUrl) {
          return res.status(500).send("Không tạo được file PDF.");
        }

        return res.redirect(PDFUrl);
      });
    });

    require.write(
      JSON.stringify({
        template: {
          id: process.env.GENERATOR_PDF_TEMPLATE_ID,
          data: data
        },
        format: "pdf",
        output: "url",
        name: data.fullName
      })
    );

    require.end();
  }
}

module.exports = new FileController();
