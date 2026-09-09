function getInversionCount(array) {
    var inversionCount = 0;

    for (let i = 0; i < array.length - 1; i++) {
        for (let j = i + 1; j < array.length; j++) {
            if (array[i] > array[j] && array[i] != gridSize ** 2 && array[j] != gridSize ** 2) {
                inversionCount++;
            };
        };
    };

    return inversionCount;
};

function getBlankRowPosition(array) {
    var gridSize = Math.sqrt(array.length);
    var blankSpaceIndex = array.indexOf(gridSize ** 2);
    var blankRow = Math.floor(blankSpaceIndex / gridSize);
    blankRow++;
    var positionFromBottom = gridSize + 1 - blankRow;
    return positionFromBottom;
};

function swapElements(array, element1, element2) {
    var tempElement = array[element1];
    array[element1] = array[element2];
    array[element2] = tempElement;
};

function isSolvable(array) {
    var inversionCount = getInversionCount(array);
    console.log("Inversion Count: " + inversionCount);
    var gridSize = Math.sqrt(array.length);
    if ((gridSize % 2 == 1) && (inversionCount % 2 == 0)) {
        return true;
    } else if (gridSize % 2 == 0) {
        var pos = getBlankRowPosition(array);
        console.log("Position Blank from Bottom: " + pos);
        if ((pos % 2 == 0) && (inversionCount % 2 == 1)) {
            return true;
        } else if ((pos % 2 == 1) && (inversionCount % 2 == 0)) {
            return true;
        };
    };
    return false;
};

function generatePuzzle(gridSize) {
    console.log("Grid Size: " + gridSize);
    var givenPuzzle = [];
    for (let k = 1; k <= gridSize ** 2; k ++) {
        givenPuzzle.push(k);
    };
    givenPuzzle.sort(() => Math.random() - 0.5);
    var solvable = isSolvable(givenPuzzle);
    while (!solvable) {
        do {
            var index1 = Math.floor(Math.random() * givenPuzzle.length);
            var index2 = Math.floor(Math.random() * givenPuzzle.length);
        } while (index1 == gridSize ** 2 || index2 == gridSize ** 2);
        swapElements(givenPuzzle, index1, index2);
        solvable = isSolvable(givenPuzzle);
    };
    console.log(isSolvable(givenPuzzle));
    return givenPuzzle;
};