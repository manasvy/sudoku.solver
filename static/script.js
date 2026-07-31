// =========================================================
// SUDOKU GAME
// =========================================================


// ---------------------------------------------------------
// GET ELEMENTS
// ---------------------------------------------------------

const cells = document.querySelectorAll(".cell");

const numberButtons = document.querySelectorAll(".number-btn");

const solveButton = document.getElementById("solve-btn");
const clearButton = document.getElementById("clear-btn");
const resetButton = document.getElementById("reset-btn");
const eraseButton = document.getElementById("erase-btn");

const status = document.getElementById("status");

const timerElement = document.getElementById("timer");
const mistakesElement = document.getElementById("mistakes");


// ---------------------------------------------------------
// VARIABLES
// ---------------------------------------------------------

let selectedCell = null;

let mistakes = 0;

let seconds = 0;

let timerStarted = false;


// ---------------------------------------------------------
// SAVE ORIGINAL PUZZLE
// ---------------------------------------------------------

const originalBoard = [];

for (let row = 0; row < 9; row++) {

    originalBoard[row] = [];

    for (let col = 0; col < 9; col++) {

        const cell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );

        originalBoard[row][col] = cell.value;
    }
}


// =========================================================
// CELL SELECTION
// =========================================================

cells.forEach(cell => {

    cell.addEventListener("click", () => {

        // Don't select fixed cells for editing
        if (cell.classList.contains("fixed")) {
            selectCell(cell);
            return;
        }

        selectCell(cell);
    });


    // -----------------------------------------------------
    // USER TYPING
    // -----------------------------------------------------

    cell.addEventListener("input", () => {

        // Allow only numbers 1-9
        cell.value = cell.value.replace(/[^1-9]/g, "");

        // Only allow one character
        if (cell.value.length > 1) {
            cell.value = cell.value.slice(0, 1);
        }

        // Start timer when user starts playing
        startTimer();

        // Remove old error styling
        cell.classList.remove("error");

        // Check whether number is valid
        if (cell.value !== "") {

            const row = Number(cell.dataset.row);
            const col = Number(cell.dataset.col);

            const number = cell.value;

            if (!isValidMove(row, col, number)) {

                cell.classList.add("error");

                mistakes++;

                mistakesElement.textContent = mistakes;

                showStatus(
                    "That number cannot be placed here.",
                    "error"
                );
            }
        }
    });

});


// =========================================================
// SELECT CELL
// =========================================================

function selectCell(cell) {

    // Remove previous selection
    cells.forEach(c => {
        c.classList.remove("selected");
    });


    // Select new cell
    selectedCell = cell;

    selectedCell.classList.add("selected");


    // Highlight related cells
    highlightRelatedCells(cell);
}


// =========================================================
// HIGHLIGHT RELATED CELLS
// =========================================================

function highlightRelatedCells(cell) {

    const selectedRow = Number(cell.dataset.row);
    const selectedCol = Number(cell.dataset.col);

    const selectedNumber = cell.value;


    cells.forEach(otherCell => {

        const row = Number(otherCell.dataset.row);
        const col = Number(otherCell.dataset.col);

        // Same row
        if (row === selectedRow) {
            otherCell.style.backgroundColor = "#eff6ff";
        }

        // Same column
        if (col === selectedCol) {
            otherCell.style.backgroundColor = "#eff6ff";
        }

        // Same number
        if (
            selectedNumber !== "" &&
            otherCell.value === selectedNumber
        ) {
            otherCell.style.backgroundColor = "#dbeafe";
        }
    });


    // Keep selected cell strongest
    cell.style.backgroundColor = "#bfdbfe";
}


// =========================================================
// NUMBER PAD
// =========================================================

numberButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Ignore erase button
        if (button.id === "erase-btn") {
            return;
        }

        if (selectedCell === null) {

            showStatus(
                "Select a cell first.",
                "error"
            );

            return;
        }


        // Don't change original numbers
        if (selectedCell.classList.contains("fixed")) {

            showStatus(
                "You cannot change an original number.",
                "error"
            );

            return;
        }


        const number = button.dataset.number;

        selectedCell.value = number;

        selectedCell.classList.remove("error");

        selectedCell.classList.remove("solved");


        // Start timer
        startTimer();


        // Check validity
        const row = Number(selectedCell.dataset.row);
        const col = Number(selectedCell.dataset.col);


        if (!isValidMove(row, col, number)) {

            selectedCell.classList.add("error");

            mistakes++;

            mistakesElement.textContent = mistakes;

            showStatus(
                "Invalid move. Try another number.",
                "error"
            );

        } else {

            showStatus(
                "Number entered.",
                "info"
            );
        }


        // Update highlighting
        highlightRelatedCells(selectedCell);
    });
});


// =========================================================
// ERASE BUTTON
// =========================================================

eraseButton.addEventListener("click", () => {

    if (selectedCell === null) {

        showStatus(
            "Select a cell first.",
            "error"
        );

        return;
    }


    if (selectedCell.classList.contains("fixed")) {

        showStatus(
            "You cannot erase an original number.",
            "error"
        );

        return;
    }


    selectedCell.value = "";

    selectedCell.classList.remove("error");

    selectedCell.classList.remove("solved");


    showStatus(
        "Cell cleared.",
        "info"
    );


    highlightRelatedCells(selectedCell);
});


// =========================================================
// KEYBOARD INPUT
// =========================================================

document.addEventListener("keydown", event => {

    if (selectedCell === null) {
        return;
    }


    // Numbers 1-9
    if (
        event.key >= "1" &&
        event.key <= "9"
    ) {

        if (selectedCell.classList.contains("fixed")) {
            return;
        }

        selectedCell.value = event.key;

        selectedCell.classList.remove("error");

        selectedCell.classList.remove("solved");

        startTimer();


        const row = Number(selectedCell.dataset.row);
        const col = Number(selectedCell.dataset.col);


        if (!isValidMove(row, col, event.key)) {

            selectedCell.classList.add("error");

            mistakes++;

            mistakesElement.textContent = mistakes;

            showStatus(
                "Invalid move.",
                "error"
            );

        } else {

            showStatus(
                "Number entered.",
                "info"
            );
        }


        highlightRelatedCells(selectedCell);
    }


    // Backspace / Delete
    if (
        event.key === "Backspace" ||
        event.key === "Delete"
    ) {

        if (
            !selectedCell.classList.contains("fixed")
        ) {

            selectedCell.value = "";

            selectedCell.classList.remove("error");

            selectedCell.classList.remove("solved");
        }
    }
});


// =========================================================
// CHECK VALID MOVE
// =========================================================

function isValidMove(row, col, number) {

    // Check row
    for (let c = 0; c < 9; c++) {

        if (c === col) {
            continue;
        }

        const cell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${c}"]`
        );

        if (cell.value === number) {
            return false;
        }
    }


    // Check column
    for (let r = 0; r < 9; r++) {

        if (r === row) {
            continue;
        }

        const cell = document.querySelector(
            `.cell[data-row="${r}"][data-col="${col}"]`
        );

        if (cell.value === number) {
            return false;
        }
    }


    // Check 3x3 box

    const startRow = Math.floor(row / 3) * 3;

    const startCol = Math.floor(col / 3) * 3;


    for (
        let r = startRow;
        r < startRow + 3;
        r++
    ) {

        for (
            let c = startCol;
            c < startCol + 3;
            c++
        ) {

            if (
                r === row &&
                c === col
            ) {
                continue;
            }


            const cell = document.querySelector(
                `.cell[data-row="${r}"][data-col="${c}"]`
            );


            if (cell.value === number) {
                return false;
            }
        }
    }


    return true;
}


// =========================================================
// GET BOARD
// =========================================================

function getBoard() {

    const board = [];


    for (let row = 0; row < 9; row++) {

        const currentRow = [];


        for (let col = 0; col < 9; col++) {

            const cell = document.querySelector(
                `.cell[data-row="${row}"][data-col="${col}"]`
            );


            if (cell.value === "") {
                currentRow.push(".");
            } else {
                currentRow.push(cell.value);
            }
        }


        board.push(currentRow);
    }


    return board;
}


// =========================================================
// SOLVE SUDOKU
// =========================================================

solveButton.addEventListener("click", async () => {

    const board = getBoard();


    showStatus(
        "🧠 Solving Sudoku...",
        "info"
    );


    solveButton.disabled = true;

    solveButton.textContent = "Solving...";


    try {

        const response = await fetch("/solve", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                board: board
            })
        });


        const data = await response.json();


        if (data.solved) {

            displaySolvedBoard(data.board);

            stopTimer();


            showStatus(
                "✓ Sudoku solved successfully!",
                "success"
            );

        } else {

            showStatus(
                "❌ This Sudoku puzzle cannot be solved.",
                "error"
            );
        }


    } catch (error) {

        console.error(error);


        showStatus(
            "❌ Could not connect to the Flask server.",
            "error"
        );
    }


    solveButton.disabled = false;

    solveButton.textContent = "🧠 Solve Sudoku";
});


// =========================================================
// DISPLAY SOLUTION
// =========================================================

function displaySolvedBoard(board) {

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            const cell = document.querySelector(
                `.cell[data-row="${row}"][data-col="${col}"]`
            );


            // Don't change original cells
            if (cell.classList.contains("fixed")) {
                continue;
            }


            cell.value = board[row][col];

            cell.classList.remove("error");

            cell.classList.add("solved");
        }
    }
}


// =========================================================
// CLEAR BOARD
// =========================================================

clearButton.addEventListener("click", () => {

    cells.forEach(cell => {

        // Keep original numbers
        if (!cell.classList.contains("fixed")) {

            cell.value = "";

            cell.classList.remove("error");

            cell.classList.remove("solved");
        }
    });


    mistakes = 0;

    mistakesElement.textContent = "0";


    showStatus(
        "🗑 Board cleared.",
        "info"
    );


    resetTimer();
});


// =========================================================
// RESET PUZZLE
// =========================================================

resetButton.addEventListener("click", () => {

    cells.forEach(cell => {

        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);


        cell.value = originalBoard[row][col];


        cell.classList.remove("error");

        cell.classList.remove("solved");

        cell.classList.remove("selected");


        // Restore original cells
        if (originalBoard[row][col] !== "") {

            cell.classList.add("fixed");

        } else {

            cell.classList.remove("fixed");
        }
    });


    selectedCell = null;


    mistakes = 0;

    mistakesElement.textContent = "0";


    showStatus(
        "🔄 Puzzle reset. Good luck!",
        "info"
    );


    resetTimer();
});


// =========================================================
// STATUS MESSAGE
// =========================================================

function showStatus(message, type) {

    status.textContent = message;


    status.classList.remove(
        "success",
        "error",
        "info"
    );


    status.classList.add(type);
}


// =========================================================
// TIMER
// =========================================================

let timerInterval = null;


function startTimer() {

    if (timerStarted) {
        return;
    }


    timerStarted = true;


    timerInterval = setInterval(() => {

        seconds++;


        const minutes =
            Math.floor(seconds / 60)
                .toString()
                .padStart(2, "0");


        const remainingSeconds =
            (seconds % 60)
                .toString()
                .padStart(2, "0");


        timerElement.textContent =
            `${minutes}:${remainingSeconds}`;

    }, 1000);
}


// =========================================================
// STOP TIMER
// =========================================================

function stopTimer() {

    clearInterval(timerInterval);

    timerStarted = false;
}


// =========================================================
// RESET TIMER
// =========================================================

function resetTimer() {

    clearInterval(timerInterval);

    timerStarted = false;

    seconds = 0;

    timerElement.textContent = "00:00";
}


// =========================================================
// START
// =========================================================

showStatus(
    "Select a cell and enter a number.",
    "info"
);