import BLOCKS from "./blocks.js";
//DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartBtn = document.querySelector(".game-text > button");
const startBtn = document.querySelector(".button-a");
const pauseBtn = document.querySelector(".button-b");

//Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;
let isPaused;
let isGameStarted = false; //게임 시작 여부 확인

const movingItem = {
    type: "",
    direction: 3,
    top: 0,
    left: 3,
};

// init()

//functions
function init(){
    tempMovingItem = {...movingItem};
    for(let i = 0; i < GAME_ROWS; i++){
        prependNewLine()
    }
    generateNewBlock();
    isGameStarted = true;
}


function prependNewLine() {
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for(let j = 0; j < GAME_COLS; j++){
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul)
    playground.prepend(li)
}

function renderBlocks(moveType = "") {
    const {type, direction, top, left} = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving");
    })
    BLOCKS[type][direction].some(block=>{
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y]
            ? playground.childNodes[y].childNodes[0].childNodes[x]
            : null;
        const isAvailable = checkEmpty(target);
        if(isAvailable){
            target.classList.add(type, "moving");
        } else {
            tempMovingItem = { ...movingItem }
            if(moveType === 'retry'){
                clearInterval(downInterval)
                GameOver()
            }
            setTimeout(()=>{
                renderBlocks('retry');
                if(moveType === "top"){
                    seizeBlock();
                }
            }, 0)
            return true;
        }
    })
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}


function seizeBlock() {
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch()
}
function checkMatch() {
    const childNodes = playground.childNodes;
    childNodes.forEach(child => {
        let matched = true;
        child.children[0].childNodes.forEach(li => {
            if(!li.classList.contains("seized")){
                matched = false;
            }
        })
        if(matched){
            child.remove();
            prependNewLine()
            score++;
            scoreDisplay.innerText = score;
        }
    })

    generateNewBlock()
}

function generateNewBlock() {
    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock('top', 1)
    }, duration)

    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random() * blockArray.length)
    movingItem.type =  blockArray[randomIndex][0]
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = {...movingItem };
    renderBlocks();

}

function checkEmpty(target){
    if(!target || target.classList.contains("seized")){
        return false;
    }
    return true;
}

function moveBlock(moveType, amount){
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType)
}

function changeDirection(){
    const direction = tempMovingItem.direction;
    direction === 3 
        ? tempMovingItem.direction = 0
        : tempMovingItem.direction += 1;
    renderBlocks()
}

function dropBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock("top", 1)
    }, 10)
}

// 일시정지 및 재개 기능
function togglePause() {
    if (!isPaused) {
        clearInterval(downInterval); 
        isPaused = true;
        pauseBtn.textContent = "재개"; 
    } else {
        downInterval = setInterval(() => {
            moveBlock('top', 1);
        }, duration);
        isPaused = false;
        pauseBtn.textContent = "일시정지";
    }
}


function GameOver(){
    gameText.style.display = "flex"
}

//handling
document.addEventListener("keydown", e=> {
    switch(e.keyCode){
        case 39:
            moveBlock("left", 1);
            break;
        case 37:
            moveBlock("left", -1);
            break;
        case 40:
            moveBlock("top", 1);
            break;
        case 38:
            changeDirection();
            break;
        case 32:
            dropBlock();
            break;
        default:
            break;
    }
})

startBtn.addEventListener("click", function() {
    if (!isGameStarted) {
        init();
    };
});

pauseBtn.addEventListener("click", togglePause);

restartBtn.addEventListener("click", ()=>{
    playground.innerHTML = "";
    gameText.style.display = "none"
    isGameStarted = false;
    init()
})