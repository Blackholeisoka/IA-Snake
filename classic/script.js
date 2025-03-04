const canvas = document.querySelector('canvas');
const scrore = document.querySelector('#score');
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

let foodX;
let foodY;

const randomFood = () => {
    foodX = Math.floor(Math.random() * verticalLines);
    foodY = Math.floor(Math.random() * horizontalLines);
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(foodX * width / verticalLines, foodY * height / horizontalLines, width / verticalLines, height / horizontalLines);
};

let snake = [
    { x: 5, y: 5 },
    { x: 6, y: 5 },
    { x: 7, y: 5 },
];

let dx = 0;
let dy = 0;

const drawSnake = () => {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? 'rgba(223, 220, 220, 0.79)' : color;
        ctx.fillRect(segment.x * width / verticalLines, segment.y * height / horizontalLines, width / verticalLines, height / horizontalLines);
    });
};

const moveSnake = () => {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    ctx.fillStyle = '#fff';
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        window.location.reload();
        return;
    }
    snake.unshift(head);
    if (head.x === foodX && head.y === foodY) {
        audio.play();
        randomFood();
        ++count;
        scrore.textContent = count;
    } else {
        snake.pop();
    }
};

const changeDirection = (event) => {
    const keyPressed = event.key;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;
    if (keyPressed === 'q' && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === 'd' && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === 's' && !goingUp) {
        dx = 0;
        dy = 1;
    }
    if (keyPressed === 'z' && !goingDown) {
        dx = 0;
        dy = -1;
    }
};

document.addEventListener('keydown', changeDirection);

const main = () => {
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawSnake();
    ctx.fillStyle = color;
    ctx.fillRect(foodX * width / verticalLines, foodY * height / horizontalLines, width / verticalLines, height / horizontalLines);
    if (dx !== 0 || dy !== 0) {
        moveSnake();
    }
    setTimeout(main, 100);
};

document.addEventListener('keydown', (event) => {
    if (['z', 'q', 's', 'd'].includes(event.key)) {
        if (!snake.length) {
            main();
        }
    }
});

randomFood();
main();

const restart = () => {
    if (snake[0].x < 0 || snake[0].x >= verticalLines || snake[0].y < 0 || snake[0].y >= horizontalLines) {
        const best = window.localStorage.getItem('best');
        if (count > best) {
            window.localStorage.setItem('best', count);
        }
        window.location.reload();
    }
};

setInterval(restart, 100);