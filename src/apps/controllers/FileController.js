const { FirestoreModel, RegisteredCombinationModel, UserModel } = require("../models");
const { CollectionNameConstant } = require("../../constants");
const { generateJWT } = require("../../utils/generateJWT");
const { exportExcelFile } = require("../../utils/exportFile");
const http = require("https");
const { exportExcelFileClass } = require("../../utils/exportFileClass");
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

  async exportClassListExcel(req, res, next) {
    const { submittedList } = req?.body;

    const keys = ["STT", "Họ tên học sinh", "Giới tính", "Ngày tháng năm sinh", "empty", "empty", "Nơi sinh", "Dân tộc", "Điểm"];

    const rows = submittedList.map((row, index) => {
      const date = row.dayOfBirth.split("-");
      return {
        index: index + 1,
        fullName: row.fullName,
        gender: row.gender,
        day: date[2],
        month: date[1],
        year: date[0],
        placeOfBirth: row.placeOfBirth,
        nation: row.nation,
        point: Number(row.englishPoint) + Number(row.literaturePoint) + Number(row.mathPoint)
      };
    });
    const buffer = exportExcelFileClass(rows, keys);
    return res.send(buffer);
  }

  async exportSubmitedPDF(req, res, next) {
    const userId = req?.params?.userId || req?.cookies?.userId;
    const templateId = req?.query?.template;
    const data = await this.registeredCombinationsDbRef.getItemByFilter({
      userId: userId
    });

    const totlaPoint = Number(data.englishPoint) + Number(data.literaturePoint) + Number(data.mathPoint);
    const combination1 = data.combination1.split(" ")[2];
    const combination2 = data.combination2.split(" ")[2];
    const t = {
      a: data?.typeStudent?.includes("Con liệt sĩ"),
      b: data?.typeStudent?.includes("Con thương binh, bệnh binh từ 81% trở lên"),
      c: data?.typeStudent?.includes("Con dân tộc thiểu số"),
      d: data?.typeStudent?.includes("Con thương binh, bệnh binh dưới 81%"),
      e: data?.typeStudent?.includes("Con Anh hùng LLVT"),
      f: data?.sick?.includes("Bệnh ngoài da"),
      g: data?.sick?.includes("Bệnh tim mạch"),
      h: data?.sick?.includes("Bệnh hô hấp")
    };

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
    const reqPDF = http.request(options, function (response) {
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

    reqPDF.write(
      JSON.stringify({
        template: {
          id: templateId,
          data: [{ ...data, total: totlaPoint, combination1, combination2, ...t }]
        },
        format: "pdf",
        output: "url",
        name: data.fullName
      })
    );

    reqPDF.end();
  }
}

module.exports = new FileController();
