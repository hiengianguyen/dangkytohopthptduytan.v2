const { removeVI } = require("jsrmvi");
const { convertVietnameseDatetimeToDate } = require("./convertVietnameseDatetimeToDate");

function filterStudentList(data, filter) {
  let result = data;

  //filter Gender.
  if (filter.gender !== "Tất cả") {
    result = result.filter((doc) => {
      return doc.gender === filter.gender;
    });
  }

  if (result.length === 0) {
    return [];
  }

  //filter Name.
  if (filter.fullName !== "") {
    result = result.filter((doc) => {
      return removeVI(doc.fullName, { replaceSpecialCharacters: false }).includes(
        removeVI(filter.fullName, { replaceSpecialCharacters: false })
      );
    });
  }

  const sort = filter.sort;

  if (sort) {
    switch (sort.name) {
      case "Họ và tên":
        result.sort((a, b) => {
          function getLastName(fullName) {
            const parts = fullName.trim().split(" ");
            return parts[parts.length - 1].toLowerCase();
          }

          const nameA = getLastName(a.fullName);
          const nameB = getLastName(b.fullName);

          if (sort.type === "asc") {
            return nameA.localeCompare(nameB);
          } else {
            return nameB.localeCompare(nameA);
          }
        });
        break;
      case "Ngày đăng ký":
        result.sort((a, b) => {
          if (sort.type === "asc") {
            return convertVietnameseDatetimeToDate(a.registeredAt) - convertVietnameseDatetimeToDate(b.registeredAt);
          } else {
            return convertVietnameseDatetimeToDate(b.registeredAt) - convertVietnameseDatetimeToDate(a.registeredAt);
          }
        });
        break;
      default:
        result.sort((a, b) => {
          const totalA = Number(a.mathPoint || "0") + Number(a.literaturePoint || "0") + Number(a.englishPoint || "0");
          const totalB = Number(b.mathPoint || "0") + Number(b.literaturePoint || "0") + Number(b.englishPoint || "0");

          if (sort.type === "asc") {
            return totalB - totalA;
          } else {
            return totalA - totalB;
          }
        });
    }
  } else {
    result.sort((a, b) => {
      return convertVietnameseDatetimeToDate(a.registeredAt) - convertVietnameseDatetimeToDate(b.registeredAt);
    });
  }

  return result;
}

module.exports = { filterStudentList };
