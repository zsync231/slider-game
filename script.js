// enables the site to look for keyboard actions
document.addEventListener("keydown", keyboardActions);

// variable definitions
var gridSize;
var puzzle;
var blankSpaceIndex;
console.log(puzzle);
console.log(blankSpaceIndex);
var moves = 0;
var solved = false;
var startTime = 0;
var elapsedTime = 0;
var elapsedTimeUnix = 0; 
var timer = null;
var isRunning = false;
var isPaused = false;
var gridSelected = false;
var countdownLength = 3;
var escPressed = false;
var active = false;
var preferredSolvingMethod = "column";
var showSplits = true;
var column = 1;
var fontSize = 120;
var orderArray = [];

// font sizes defined statically for each grid size,
// as the font size needs to be smaller for larger grids
var fontSizes = [120, 120, 120, 108, 90, 80, 56, 50, 44, 40, 40, 38, 34, 32, 30, 28, 26, 24, 24, 22, 22, 20];

// generates the buttons for the grid size selection screen
for (let r = 0; r < 2; r++) {
    // generates a row for the grid size buttons
    var newButtonRow = selectGridButtons.insertRow(-1);
    for (let c = 0; c < 11; c++) {
        // adds the cells in the row and creates a button in each cell
        var newButtonCell = newButtonRow.insertCell(-1);
        var newButton = document.createElement("button");
        newButtonCell.appendChild(newButton);
        newButton.innerHTML = r * 11 + c + 4;

        // click events for each button
        newButton.onclick = function () {

            // sets the grid size to the number on the button that was clicked
            gridSize = Number(this.innerHTML);

            // generates the order array used for the splits
            for (let i = 0; i < gridSize; i++) {
                orderArray.push(1 + gridSize * i);
            };
            console.log(orderArray);

            // generates the puzzle using the method in generate_puzzle.js
            puzzle = generatePuzzle(gridSize);

            // gets the index of the blank space in the puzzle
            blankSpaceIndex = puzzle.indexOf(gridSize ** 2);

            generateVisualPuzzle(gridSize);

            // hides the grid selection screen and shows the grid
            gridSelectScreen.style.visibility = "hidden";
            gridSelected = true;
            grid.style.visibility = "visible";

        };
    };
};

// updates the splits table when a column is completed
function updateSplits() {

    var update = true;

    for (let i = 0; i < gridSize; i++) {

        if (puzzle[orderArray[i] - 1] != orderArray[i]) { //&& (update)) { // unnecessary part?
            update = false;
        };
    };

    console.log(update);

    // if the column is completed,
    // add a new row to the splits table with the time for that column
    if (update && (column < gridSize - 1)) {
        var newSplit = splitTable.insertRow(-1);
        var newCell = newSplit.insertCell(-1);
        newCell.innerHTML = "Column " + column;
        newCell.style.width = "230px";
        newCell = newSplit.insertCell(-1);
        newCell.innerHTML = timerDisplay.innerHTML;
        newCell.style.width = "150px";
        newCell.style.textAlign = "right";
        column++;
        for (let i = 0; i < gridSize; i++) {
            orderArray[i]++;
        };
    };
};

// updates the clock and date display
function updateClock() {
    var today = new Date();
    var hh = String(today.getHours()).padStart(2, "0");
    var mm = String(today.getMinutes()).padStart(2, "0");
    var ss = String(today.getSeconds()).padStart(2, "0");
    var day = String(today.getDate()).padStart(2, "0");
    var month = String(today.getMonth() + 1).padStart(2, "0");
    var year = String(today.getFullYear());
    clockDisplay.innerHTML = `${hh}:${mm}:${ss}`;
    dateDisplay.innerHTML = `${day}/${month}/${year}`;
};

// starts the timer
function startTimer() {
    if (!isRunning) {
        startTime = Date.now() - elapsedTimeUnix;
        timer = setInterval(updateTimer, 10);
        isRunning = true;
    };
};

// sleep function
async function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};

// stops the timer
function stopTimer() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
    };
};

// updates the record time display
function updateRecordTimeDisplay() {
    console.log(localStorage.getItem(`${gridSize}x${gridSize} best time`));
    if (localStorage.getItem(`${gridSize}x${gridSize} best time`) != null) {
        var recordTime = Number(localStorage.getItem(`${gridSize}x${gridSize} best time`));
        var minutes = String(Math.floor(recordTime / 6000)).padStart(2, "0");
        var seconds = String(Math.floor((recordTime % 6000) / 100)).padStart(2, "0");
        var tenthseconds = String(Math.floor((recordTime % 100))).padStart(2, "0");
        recordDisplayElements[1].innerHTML = `${minutes}:${seconds}.${tenthseconds}`;
        recordDisplay.style.visibility = "visible";
    } else {
        recordDisplay.style.visibility = "hidden";
    };
};

// updates the timer display every tick
function updateTimer() {
    var currentTime = Date.now();
    elapsedTimeUnix = currentTime - startTime;
    elapsedTime = Math.floor((elapsedTimeUnix) / 10);
    var minutes = String(Math.floor(elapsedTime / 6000)).padStart(2, "0");
    var seconds = String(Math.floor((elapsedTime % 6000) / 100)).padStart(2, "0");
    var tenthseconds = String(Math.floor((elapsedTime % 100))).padStart(2, "0");
    timerDisplay.innerHTML = `${minutes}:${seconds}.${tenthseconds}`;
    if (elapsedTime > Number(localStorage.getItem(`${gridSize}x${gridSize} best time`)) && localStorage.getItem(`${gridSize}x${gridSize} best time`) != null) {
        timerDisplay.style.color = "#ff0000";
    };
};


function generateVisualPuzzle(gridSize) {
    // generates the grid for the tiles as a table
    for (let r = 0; r < gridSize; r++) {
        var newRow = grid.insertRow(-1);
        for (let c = 0; c < gridSize; c++) {
            var newCell = newRow.insertCell(-1);
        };
    };

    // sets the properties of each cell in the table based on its number
    for (let t = 0; t < tiles.length; t++) {

        // sets the number of the tile to the number in the puzzle array and its font size
        tiles[t].innerHTML = puzzle[t];
        tiles[t].style.fontSize = fontSizes[gridSize - 4] + "px";

        // sets the colour of the tile based on its number,
        // and makes the blank space invisible
        if (puzzle[t] == gridSize ** 2) {
            tiles[t].style.color = "#00000000";
            tiles[t].style.backgroundColor = `#000000`;
        } else {
            tiles[t].style.backgroundColor = `hsl(${Math.floor(((puzzle[t] - 1) % gridSize) / gridSize * 360)}, 100%, 50%)`;
        };

        // click events for each tile
        tiles[t].onclick = function () {
            if (getAdjacentCells(blankSpaceIndex).includes(t) && solved == false) {
                swapCells(t);
                checkPuzzle();
            };

            // manages the timer
            if (!isRunning && !solved) {
                startTimer();
            } else if (isRunning && solved) {
                stopTimer();
            };
        };
    };
};

// quick function to get random element from an array
function chooseFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
};

// swaps two elements in an array
function swapCells(index) {
    tiles[blankSpaceIndex].innerHTML = tiles[index].innerHTML;
    tiles[blankSpaceIndex].style.color = "#000000";
    tiles[blankSpaceIndex].style.backgroundColor = tiles[index].style.backgroundColor;
    puzzle[blankSpaceIndex] = Number(tiles[index].innerHTML);
    puzzle[index] = gridSize ** 2;
    tiles[index].innerHTML = gridSize ** 2;
    tiles[index].style.color = "#00000000";
    tiles[index].style.backgroundColor = "#000000";
    blankSpaceIndex = index;
    if (showSplits) {
        updateSplits();
    };
};

// gets the adjacent cells of a given index in the puzzle
function getAdjacentCells(index) {
    var adjacentCells = [];
    if (index >= gridSize) {
        adjacentCells.push(index - gridSize);
    };
    if (index % gridSize != gridSize - 1) {
        adjacentCells.push(index + 1);
    };
    if (index <= gridSize * (gridSize - 1) - 1) {
        adjacentCells.push(index + gridSize);
    };
    if (index % gridSize != 0) {
        adjacentCells.push(index - 1);
    };
    return adjacentCells;
};

// checks if the puzzle is solved
function checkPuzzle() {
    solved = true;
    for (let t = 0; t < tiles.length - 1; t++) {
        if (Number(tiles[t].innerHTML) != t + 1) {
            solved = false;
        };
    };
};

// moves the tiles on the board based on the keyboard actions of the user
function keyboardActions(event) {
    if (gridSelected) {
        // checks if the key pressed is an arrow key and if the game is not paused
        if ((event.key == "ArrowUp" || event.key == "ArrowLeft" || event.key == "ArrowDown" || event.key == "ArrowRight") && (!isPaused)) {
            if (!active && !solved) {
                active = true;
                recordDisplay.style.visibility = "hidden";
            };
            // up arrow key moves the tile below the blank space up
            if (event.key == "ArrowUp" && getAdjacentCells(blankSpaceIndex).includes(blankSpaceIndex + gridSize) && solved == false) {
                swapCells(blankSpaceIndex + gridSize);
                moves++;
                movesDisplay.innerHTML = moves;
                checkPuzzle();
                // left arrow key moves the tile to the right of the blank space left
            } else if (event.key == "ArrowLeft" && getAdjacentCells(blankSpaceIndex).includes(blankSpaceIndex + 1) && solved == false) {
                swapCells(blankSpaceIndex + 1);
                moves++;
                movesDisplay.innerHTML = moves;
                checkPuzzle();
                // down arrow key moves the tile above the blank space down
            } else if (event.key == "ArrowDown" && getAdjacentCells(blankSpaceIndex).includes(blankSpaceIndex - gridSize) && solved == false) {
                swapCells(blankSpaceIndex - gridSize);
                moves++;
                movesDisplay.innerHTML = moves;
                checkPuzzle();
                // right arrow key moves the tile to the left of the blank space right
            } else if (event.key == "ArrowRight" && getAdjacentCells(blankSpaceIndex).includes(blankSpaceIndex - 1) && solved == false) {
                swapCells(blankSpaceIndex - 1);
                moves++;
                movesDisplay.innerHTML = moves;
                checkPuzzle();
            };
            if (!isRunning && !solved) {
                startTimer();
            } else if (isRunning && solved) {
                // code which runs once the puzzle has been solved
                stopTimer();
                updateRecordTimeDisplay();
                tiles[blankSpaceIndex].innerHTML = blankSpaceIndex + 1;
                tiles[blankSpaceIndex].style.color = "#000000";
                tiles[blankSpaceIndex].style.backgroundColor = `hsl(${Math.floor((gridSize - 1) / gridSize * 360)}, 100%, 50%)`;
                
                // date variables
                var current = new Date();
                var date = String(current.getDate()).padStart(2, "0");
                var month = String(current.getMonth() + 1).padStart(2, "0");
                var year = String(current.getFullYear());
                var hour = String(current.getHours()).padStart(2, "0");
                var minute = String(current.getMinutes()).padStart(2, "0");

                // if it is the first time a puzzle of that size has been solved, treat it as a new record
                if (localStorage.getItem(`${gridSize}x${gridSize} best time`) == null) {
                    localStorage.setItem(`${gridSize}x${gridSize} best time`, elapsedTime);
                    localStorage.setItem(`${gridSize}x${gridSize} record set`, `${date}/${month}/${year} ${hour}:${minute}`);
                    timerDisplay.style.color = "#00b7ff";

                    // if it is not the first time, check if the time is better than the previous record
                } else if (elapsedTime < Number(localStorage.getItem(`${gridSize}x${gridSize} best time`))) {
                    localStorage.setItem(`${gridSize}x${gridSize} best time`, elapsedTime);
                    localStorage.setItem(`${gridSize}x${gridSize} record set`, `${date}/${month}/${year} ${hour}:${minute}`);
                    timerDisplay.style.color = "#00b7ff";
                    recordDisplayElements[0].innerHTML = "previous record:";

                    // if it is not the first time and the time is worse than the previous record
                } else {
                    timerDisplay.style.color = "#808080";
                    recordDisplayElements[0].innerHTML = "current record:";
                };

                // if splits are enabled, add final row
                if (showSplits) {
                    var newSplit = splitTable.insertRow(-1);
                    var newCell = newSplit.insertCell(-1);
                    newCell.innerHTML = "Columns " + (gridSize - 1) + " & " + gridSize;
                    newCell = newSplit.insertCell(-1);
                    newCell.innerHTML = timerDisplay.innerHTML;
                    newCell.style.textAlign = "right";
                };
                active = false;
            };

            // if the escape key is pressed, pause the game
        } else if ((event.key == "Escape") && (!isPaused) && (active)) {
            pauseGame();
            // if the escape key is pressed while the game is paused, unpause the game
        } else if ((event.key == "Escape") && (isPaused) && (!escPressed) && (!active)) {
            escPressed = true;
            unpauseGame();
        };
    };
};

// recolours the tiles so that if they are in the correct position, they are brighter
function recolourTiles() {
    for (let t = 0; t < tiles.length; t++) {
        if (tiles[t].innerHTML != t + 1 && t != blankSpaceIndex) {
            tiles[t].style.backgroundColor = `hsl(${Math.floor(Number(tiles[t].innerHTML - 1) % gridSize / gridSize * 360)}, 100%, 20%)`;
        } else {
            tiles[t].style.backgroundColor = `hsl(${Math.floor(Number(tiles[t].innerHTML - 1) % gridSize / gridSize * 360)}, 100%, 50%)`;
        };
    };
    tiles[blankSpaceIndex].innerHTML = gridSize ** 2;
    tiles[blankSpaceIndex].style.color = "#00000000";
    tiles[blankSpaceIndex].style.backgroundColor = "#000000";
};

// pauses the game
function pauseGame() {
    stopTimer();
    isPaused = true;
    active = false;
    pausedScreen.style.visibility = "visible";
    pausedScreenTexts[0].style.visibility = "visible";
    pausedScreenTexts[1].style.visibility = "visible";

};

// unpauses the game, with a countdown before the game resumes
async function unpauseGame() {
    stopTimer();
    pausedScreenTexts[0].style.visibility = "hidden";
    pausedScreenTexts[1].style.visibility = "hidden";
    pausedScreenTexts[2].style.visibility = "visible";
    pausedScreen.style.visibility = "visible";
    for (let i = countdownLength; i > 0; i--) {
        pausedScreenTexts[2].innerHTML = i;
        await sleep(1);
    };
    pausedScreenTexts[2].style.visibility = "hidden";
    pausedScreen.style.visibility = "hidden";
    startTimer();
    isPaused = false;
    escPressed = false;
    active = true;
};

updateClock();
setInterval(updateClock, 1000);
