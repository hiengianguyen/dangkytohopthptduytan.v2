function checkCombinationAndCount(combinationNumber, arr) {
    switch (combinationNumber) {
        case "1":
        arr[0] = arr[0] + 1;
        break;
        case "2":
        arr[1] = arr[1] + 1;
        break;
        case "3":
        arr[2] = arr[2] + 1;
        break;
        case "4":
        arr[3] = arr[3] + 1;
        break;
        case "5":
        arr[4] = arr[4] + 1;
        break;
        case "6":
        arr[5] = arr[5] + 1;
        break;
    }
}

module.exports = { checkCombinationAndCount };
