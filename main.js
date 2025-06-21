import { LoadBar } from './classes.js';
import { Subtitle } from './classes.js';
import { music } from './sounds.js';
import { sounds } from './sounds.js';

const canvas = document.querySelector(".canvas");
const ctx = canvas.getContext('2d');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

let bar = null;
const endDate = new Date(2025, 5, 29, 0, 0, 0); // Месяцы 0-indexed (5 = Июнь)

const subtitle = new Subtitle({
    text: 'Скоро...',
    position: {
        x: Math.floor(width / 2),
        y: Math.floor(height - 80), // 50px от нижнего края
    },
    color: '#ffffff',
    fontSize: '28px',
    fontFamily: 'Arial, sans-serif',
    canvas: canvas
});

subtitle.show();

function formatTime(value) {
    return value.toString().padStart(2, '0');
}

function setTime() {
    const now = new Date();
    const diffInSeconds = Math.floor((endDate - now) / 1000);
    const timer = document.querySelector('.timer-display');

    if (diffInSeconds <= 0) {
        timer.textContent = "00:00:00:00";
        if (!bar) {
            bar = new LoadBar({
                position: { 
                    x: Math.floor(width / 2) - 150, 
                    y: Math.floor(height / 1.4) 
                },
                color: 'green',
                loadWidth: 0,
                ctx: ctx,
                canvHeight: height
            });
        }

        setTimeout(() => {
            subtitle.updateText("Пользователь, мне кажется, или полоска загрузки застряла?");
        }, 4000);

        return;
    }

    const days = Math.floor(diffInSeconds / 86400);
    const hours = Math.floor((diffInSeconds % 86400) / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;

    timer.textContent = `${formatTime(days)}:${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;

    // subtitle.show();
}

function animate() {
    window.requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);

    subtitle.draw(ctx);

    if (bar) {
        bar.update();

    } 
}

// Функция для получения координат мыши относительно канваса
function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// Обработчики событий мыши
canvas.addEventListener('mousedown', (event) => {
    if (bar) {
        const point = getMousePos(event);
        bar.handleMouseDown(point);
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (bar) {
        const point = getMousePos(event);
        bar.handleMouseMove(point);
        
    }
});

canvas.addEventListener('mouseup', () => {
    if (bar) {
        bar.handleMouseUp();
    }
});

// Инициализация
setTime();
setInterval(setTime, 1000);
animate();