const canvas = document.querySelector('canvas');
const score = document.querySelector('#score');
const scoreTop = document.querySelector('#score_top');

const audio = document.querySelector('audio');
scoreTop.textContent = window.localStorage.getItem('best') ? window.localStorage.getItem('best') : 'Aucun';

const ctx = canvas.getContext('2d');
let count = 0;

const width = canvas.width;
const height = canvas.height;

const color = "rgba(255, 255, 255, 0.5)";
const horizontalLines = 20;
const verticalLines = 20;

let gameOver = false; 

const drawGrid = () => {
    for (let i = 0; i < horizontalLines; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * height / horizontalLines);
        ctx.lineTo(width, i * height / horizontalLines);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
    for (let i = 0; i < verticalLines; i++) {
        ctx.beginPath();
        ctx.moveTo(i * width / verticalLines, 0);
        ctx.lineTo(i * width / verticalLines, height);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
};

let foodX, foodY;

const randomFood = () => {
    let newFoodX, newFoodY;
  
    do {
        newFoodX = Math.floor(Math.random() * verticalLines);
        newFoodY = Math.floor(Math.random() * horizontalLines);
    } while (snake.some((segment) => segment.x === newFoodX && segment.y === newFoodY));

    foodX = newFoodX;
    foodY = newFoodY;
};

let snake = [
    { x: 5, y: 5 },
    { x: 6, y: 5 },
    { x: 7, y: 5 }
];

let dx = 0, dy = 0;

const drawSnake = () => {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? 'rgba(223, 220, 220, 0.79)' : color;
        ctx.fillRect(segment.x * width / verticalLines, segment.y * height / horizontalLines, width / verticalLines, height / horizontalLines);
    });
};

const moveSnake = () => {
    if (gameOver) return; 

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (snake.some(segment => segment.x === head.x && segment.y === head.y) || head.x < 0 || head.x >= verticalLines || head.y < 0 || head.y >= horizontalLines) {
        const best = window.localStorage.getItem('best');
        if (count > (best ? parseInt(best) : 0)) {
            window.localStorage.setItem('best', count);
        }

        gameOver = true; 
        return; 
    }

    snake.unshift(head);
    if (head.x === foodX && head.y === foodY) {
        audio.play();
        randomFood();
        count++;
        score.textContent = count;
    } else {
        snake.pop();
    }
};

const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

const getNeighbors = (node) => [
    { x: node.x - 1, y: node.y }, 
    { x: node.x + 1, y: node.y },
    { x: node.x, y: node.y - 1 }, 
    { x: node.x, y: node.y + 1 }  
]
.filter(n => 
    n.x >= 0 && n.x < verticalLines && 
    n.y >= 0 && n.y < horizontalLines && 
    !snake.some(segment => segment.x === n.x && segment.y === n.y) 
);

const aStar = (start, goal) => {
    const openSet = [start];
    
    const cameFrom = {};
    
    const gScore = { [`${start.x},${start.y}`]: 0 };
    
    const fScore = { [`${start.x},${start.y}`]: heuristic(start, goal) };

    while (openSet.length) {
        openSet.sort((a, b) => fScore[`${a.x},${a.y}`] - fScore[`${b.x},${b.y}`]);
        
        let current = openSet.shift();
        
        if (current.x === goal.x && current.y === goal.y) {
            let path = [];
            while (cameFrom[`${current.x},${current.y}`]) {
                path.unshift(current); 
                current = cameFrom[`${current.x},${current.y}`]; 
            }
            return path; 
        }

        for (let neighbor of getNeighbors(current)) {
            let tempG = gScore[`${current.x},${current.y}`] + 1;

            if (tempG < (gScore[`${neighbor.x},${neighbor.y}`] || Infinity)) {
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                
                gScore[`${neighbor.x},${neighbor.y}`] = tempG;
                
                fScore[`${neighbor.x},${neighbor.y}`] = tempG + heuristic(neighbor, goal);

                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    return null;
};

const moveIa = () => {
    let start = {x: snake[0].x, y: snake[0].y};

    let goal = {x: foodX, y: foodY};

    let path = aStar(start, goal);

    if (path && path.length > 0) {
        let nextMove = path[0];

        dx = nextMove.x - snake[0].x; 
        dy = nextMove.y - snake[0].y; 
    }
}

const main = () => {
    if (gameOver) return;

    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawSnake();
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(foodX * width / verticalLines, foodY * height / horizontalLines, width / verticalLines, height / horizontalLines);
    moveIa();  
    moveSnake();  
    setTimeout(main, 100);
};

randomFood();
main();