function countClassStudent(arr) {
  const count = {};
  arr.forEach((item) => {
    if (item.classId !== "") {
      count[item.classId] = count[item.classId] ? count[item.classId] + 1 : 1;
    }
  });

  return count;
}

module.exports = { countClassStudent };
