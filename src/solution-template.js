/*
*
* "board" is a matrix that holds data about the
* game board, in a form of BoardSquare objects
*
* openedSquares holds the position of the opened squares
*
* flaggedSquares holds the position of the flagged squares
*
 */
let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;


/*
*
* the probability of a bomb in each square
*
 */
let bombProbability = 3;
let maxProbability = 15;

let easy = {
    'rowCount': 9,
    'colCount': 9
};
// TODO you can declare here the medium and expert difficulties
let medium = {
    'rowCount': 16,
    'colCount': 16
};
let expert = {
    'rowCount': 16,
    'colCount': 30
};


document.getElementById('startGame').addEventListener('click', () => {
    const difficulty = document.getElementById('difficulty').value;
    bombProbability = parseFloat(document.getElementById('bombProbability').value);
    maxProbability = parseFloat(document.getElementById('maxProbability').value);

    switch(difficulty){
        case 'easy':
            bombProbability = 3;
            document.getElementById('bombProbability').value = bombProbability;
            generateBoard(easy);
            break;
        case 'medium':
            bombProbability = 5;
            document.getElementById('bombProbability').value = bombProbability;
            generateBoard(medium);
            break;
        case 'expert':
            bombProbability = 7;
            document.getElementById('bombProbability').value = bombProbability;
            generateBoard(expert);
            break;
    }
});


function startWithDefault(){
    bombProbability = 3;
    document.getElementById('bombProbability').value = bombProbability;
    generateBoard(easy);
}


function generateBoard(boardMetadata) {
    squaresLeft = boardMetadata.colCount * boardMetadata.rowCount;
    bombCount = 0;
    board = [];
    openedSquares = [];
    flaggedSquares = [];

    /*
    *
    * "generate" an empty matrix
    *
     */
    for (let i = 0; i < boardMetadata.colCount; i++) {
        board[i] = new Array(boardMetadata.rowCount);
    }

    /*
    *
    * TODO fill the matrix with "BoardSquare" objects, that are in a pre-initialized state
    *
    */

    for(let i = 0; i < boardMetadata.colCount; i++){
        for(let j = 0; j < boardMetadata.rowCount; j++){
            board[i][j] = new BoardSquare(false, 0);
        }
    }

    /*
    *
    * "place" bombs according to the probabilities declared at the top of the file
    * those could be read from a config file or env variable, but for the
    * simplicity of the solution, I will not do that
    *
    */
    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            // TODO place the bomb, you can use the following formula: Math.random() * maxProbability < bombProbability
            if(Math.random() * maxProbability < bombProbability) {
                board[i][j].hasBomb = true;
                bombCount++;
            }
        }
    }

    /*
    *
    * TODO set the state of the board, with all the squares closed
    * and no flagged squares
    *
     */

    /*
    *
    * TODO count the bombs around each square
    *
    */

    for(let i = 0; i < boardMetadata.colCount; i++){
        for(let j = 0; j <boardMetadata.rowCount; j++){
            if(!board[i][j].hasBomb){
                board[i][j].bombsAround = countBombsAround(i, j, boardMetadata);
            }
        }
    }

    /*
    *
    * print the board to the console to see the result
    *
    */
    console.log(board);

    renderBoard();

}

//BELOW THERE ARE SHOWCASED TWO WAYS OF COUNTING THE VICINITY BOMBS
function countBombsAround(x, y, boardMetadata){
    let bombCount = 0;

    for(let i = -1; i <= 1; i++){
        for(let j = -1; j <= 1; j++){
            let newX = x + i;
            let newY = y + j;
            if(newX >= 0 && newX < boardMetadata.colCount && newY >=0 && newY < boardMetadata.rowCount){
                if(board[newX][newY].hasBomb){
                        bombCount++;
                    }
                }
            }
        }
        return bombCount;
}

function renderBoard(){
    const gameBoard = document.getElementById('game-container');
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${board.length}, 40px)`;
    gameBoard.style.gridTemplateRows = `repeat(${board[0].length}, 40px)`;

    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[i].length; j++){
            const squareDiv = document.createElement('div');
            squareDiv.classList.add('square');
            squareDiv.setAttribute('data-x', i);
            squareDiv.setAttribute('data-y', j);
    
            squareDiv.addEventListener('click', () => {
                openedSquare(i, j);
            });
    
            squareDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(i, j);
                // console.log("flag open");
            });
    
            gameBoard.appendChild(squareDiv);
        }
    }
}


function openedSquare(x, y){
    const position = `${x}, ${y}`;
    if(openedSquares.includes(position)){
        return;
    }

    openedSquares.push(position);
    squaresLeft--;

    const squareDiv = document.querySelector(`.square[data-x="${x}"][data-y="${y}"]`);
    squareDiv.classList.add('open');
    squareDiv.classList.remove('flagged');
    squareDiv.style.cursor = 'default';

    if(board[x][y].hasBomb){
        squareDiv.classList.add('bomb');
        squareDiv.innerHTML = '💣';
        revealAllBombs();
        alert('Game over!');
    } else if(board[x][y].bombsAround > 0){
        squareDiv.innerHTML = board[x][y].bombsAround;
    }else{
        //if no bombs around, open all the neighbouring squares
        for(let i = -1; i <=1; i++){
            for(j = -1; j <= 1; j++){
                let newX = x + i;
                let newY = y + j;
                if(newX >= 0 && newX < board.length && newY >= 0 && newY < board[0].length){
                    openedSquare(newX, newY);
                }
            }
        }
    }

    if(squaresLeft === bombCount){
        alert('Game won! You are the best!');
        revealAllBombs();
    }
}


function toggleFlag(x, y){
    const position = `${x}, ${y}`;

    //if the square was already opened, it makes no sense to flag it
    if(openedSquares.includes(position)){
        return;
    }

    const squareDiv = document.querySelector(`.square[data-x="${x}"][data-y="${y}"]`);
    if (flaggedSquares.includes(position)) {
        flaggedSquares = flaggedSquares.filter(p => p !== position);
        squareDiv.classList.remove('flagged');
        squareDiv.innerHTML = '';
    } else {
        flaggedSquares.push(position);
        squareDiv.classList.add('flagged');
        squareDiv.innerHTML = '🚩';
    }
}


function revealAllBombs(){
    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[i].length; j++){
            if(board[i][j].hasBomb) {
                const squareDiv = document.querySelector(`.square[data-x="${i}"][data-y="${j}"]`);
                squareDiv.classList.add('bomb');
                squareDiv.innerHTML = '💣';
            }
        }
    }
}


/*
*
* simple object to keep the data for each square
* of the board
*
*/
class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
    }
}

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


/*
* call the function that "handles the game"
* called at the end of the file, because if called at the start,
* all the global variables will appear as undefined / out of scope
*
 */
// TODO create the other required functions such as 'discovering' a tile, and so on (also make sure to handle the win/loss cases)

