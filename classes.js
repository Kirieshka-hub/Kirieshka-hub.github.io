export class LoadBar {
    constructor({ position, color, loadWidth, height = 50, width = 300, ctx, canvHeight }) {
        this.ctx = ctx;
        this.canvasHeight = canvHeight;

        this.isLoad = true; // Флаг начальной загрузки
        this.isStuck = false; // Флаг "застревания"
        this.hasInteracted = false; // Флаг, указывающий на начало взаимодействия

        this.position = position;
        this.width = width;
        this.height = height;
        this.color = color;
        this.loadWidth = loadWidth;
        this.targetLoadWidth = loadWidth; // Целевая ширина заполнения

        this.angle = 0;
        this.edgeWidth = 10;
        this.isDragging = false;
        this.dragEnd = null; // Отслеживание, какой конец тянется ('left' или 'right')

        this.stuckThreshold = this.width * 0.4; // Уровень "застревания" (40% ширины)
        this.autoFillSpeed = 0.3; // Скорость автоматического заполнения
        this.maxAngle = Math.PI / 3; // Ограничение наклона ±60° (π/3 радиан)
    }

    // Вычисление центра полосы
    getCenter() {
        return {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        };
    }

    // Получение позиций концов для перетаскивания
    getEnds() {
        const center = this.getCenter();
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        const halfWidth = this.width / 2;

        // Вращение концов вокруг центра
        const leftEnd = {
            x: center.x + (-halfWidth * cos - 0 * sin),
            y: center.y + (-halfWidth * sin + 0 * cos)
        };
        const rightEnd = {
            x: center.x + (halfWidth * cos - 0 * sin),
            y: center.y + (halfWidth * sin + 0 * cos)
        };

        return { leftEnd, rightEnd };
    }

    // Проверка, попала ли точка в область конца
    isPointInEnd(point) {
        const { leftEnd, rightEnd } = this.getEnds();
        const hitRadius = this.edgeWidth * 2; // Размер хитбокса концов

        const leftDist = Math.hypot(point.x - leftEnd.x, point.y - leftEnd.y);
        const rightDist = Math.hypot(point.x - rightEnd.x, point.y - rightEnd.y);

        if (leftDist < hitRadius) return 'left';
        if (rightDist < hitRadius) return 'right';
        return null;
    }

    // Обработка нажатия мыши для начала перетаскивания
    handleMouseDown(point) {
        const end = this.isPointInEnd(point);
        if (end) {
            this.isDragging = true;
            this.dragEnd = end;
            this.hasInteracted = true; // Устанавливаем флаг взаимодействия
        }
    }

    // Обработка движения мыши для обновления вращения
    handleMouseMove(point) {
        if (!this.isDragging) return;

        const center = this.getCenter();
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        let newAngle = Math.atan2(dy, dx);

        // Корректировка угла для левого конца
        if (this.dragEnd === 'left') {
            newAngle += Math.PI; // Обратное направление для левого конца
        }

        // Нормализация угла в диапазоне [-π, π)
        let normalizedAngle = newAngle;
        if (normalizedAngle >= Math.PI) normalizedAngle -= 2 * Math.PI;
        if (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;

        // Ограничение угла в пределах ±maxAngle (±π/3)
        let constrainedAngle = normalizedAngle;
        if (Math.abs(normalizedAngle) > this.maxAngle) {
            constrainedAngle = normalizedAngle > 0 ? this.maxAngle : -this.maxAngle;
        }

        // Применение ограниченного угла
        this.angle = ((constrainedAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    }

    // Обработка отпускания мыши
    handleMouseUp() {
        this.isDragging = false;
        this.dragEnd = null;
    }

    draw() {
        this.ctx.save();

        // Тень для полосы
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 5;
        this.ctx.shadowOffsetY = 5;

        // Перемещение в центр прямоугольника
        const center = this.getCenter();
        this.ctx.translate(center.x, center.y);

        // Применение вращения
        this.ctx.rotate(this.angle);

        // Создание градиента в локальных координатах
        const gradient = this.ctx.createLinearGradient(
            -this.width / 2, 0,
            this.width / 2, 0
        );
        gradient.addColorStop(0, 'lightgreen');
        gradient.addColorStop(1, this.color);

        // Рисование заполненного прямоугольника
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
            -this.width / 2,
            -this.height / 2,
            this.loadWidth,
            this.height
        );

        // Рисование обводки
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        // Рисование концов для перетаскивания (визуальная обратная связь)
        this.ctx.fillStyle = 'blue';
        this.ctx.beginPath();
        this.ctx.arc(-this.width / 2, 0, this.edgeWidth, 0, Math.PI * 2);
        this.ctx.arc(this.width / 2, 0, this.edgeWidth, 0, Math.PI * 2);
        this.ctx.fill();

        // Точка центра для отладки
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(-2, -2, 4, 4);

        this.ctx.restore();

        // Сброс тени
        this.ctx.shadowColor = 'transparent';
    }

    update() {
        // Конвертация угла в градусы для отладки
        let degreeAngle = (this.angle * (180 / Math.PI)).toFixed(2);

        // Нормализация угла в диапазоне [0, 2π)
        let normalizedAngle = ((this.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        if (this.isLoad && !this.isStuck) {
            // Автоматическое заполнение до "застревания" (40%)
            this.loadWidth += this.autoFillSpeed;
            if (this.loadWidth >= this.stuckThreshold) {
                this.loadWidth = this.stuckThreshold;
                this.isLoad = false; // Остановка автоматического заполнения
                this.isStuck = true; // Полоса "застревает"
            }
        } else if (this.isStuck && this.hasInteracted) {
            // Изменение заполнения только после начала взаимодействия
            // Определение четверти
            const quarter1 = normalizedAngle >= 0 && normalizedAngle < Math.PI / 2; // 0°–90°
            const quarter2 = normalizedAngle >= Math.PI / 2 && normalizedAngle < Math.PI; // 90°–180°
            const quarter3 = normalizedAngle >= Math.PI && normalizedAngle < 3 * Math.PI / 2; // 180°–270°
            const quarter4 = normalizedAngle >= 3 * Math.PI / 2 && normalizedAngle < 2 * Math.PI; // 270°–360°

            // Скорость изменения зависит от абсолютного значения угла
            const absAngle = Math.min(Math.abs(normalizedAngle), this.maxAngle); // Ограничиваем угол до maxAngle
            const fillSpeed = (absAngle / this.maxAngle) * 0.005; // Линейная зависимость от угла
            const maxFillSpeed = 0.005; // Максимальная скорость
            const minFillSpeed = 0.001; // Минимальная скорость

            // Установка целевой ширины в зависимости от четверти
            if (quarter1 || quarter3) {
                // Увеличение заполнения
                this.targetLoadWidth = this.width;
            } else if (quarter2 || quarter4) {
                // Уменьшение заполнения
                this.targetLoadWidth = 0;
            }

            // Плавное изменение loadWidth
            const speed = Math.max(minFillSpeed, Math.min(fillSpeed, maxFillSpeed));
            this.loadWidth += (this.targetLoadWidth - this.loadWidth) * speed;

            // Ограничение loadWidth в пределах [0, this.width]
            this.loadWidth = Math.max(0, Math.min(this.loadWidth, this.width));
        }

        // Отрисовка полосы
        this.draw();
        //console.log(`Angle: ${degreeAngle}°, LoadWidth: ${this.loadWidth.toFixed(2)}, IsStuck: ${this.isStuck}, HasInteracted: ${this.hasInteracted}, NormalizedAngle: ${(normalizedAngle * 180 / Math.PI).toFixed(2)}°`);
    }

    points() {
        const center = this.getCenter();
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        // Вычисление повёрнутых углов
        const corners = [
            { x: -halfWidth, y: -halfHeight }, // leftTop
            { x: halfWidth, y: -halfHeight },  // rightTop
            { x: -halfWidth, y: halfHeight },  // leftBottom
            { x: halfWidth, y: halfHeight }    // rightBottom
        ];

        const rotated = corners.map(corner => ({
            x: center.x + (corner.x * cos - corner.y * sin),
            y: center.y + (corner.x * sin + corner.y * cos)
        }));

        return {
            leftTop: rotated[0],
            rightTop: rotated[1],
            leftBottom: rotated[2],
            rightBottom: rotated[3]
        };
    }
}

export class Subtitle {
    constructor({ text, position, color = 'white', baseFontSize = 20, fontFamily = "Arial", canvas }) {
        this.text = text;
        this.position = position;
        this.color = color;
        this.baseFontSize = baseFontSize; // Base font size in pixels
        this.fontFamily = fontFamily;
        this.canvas = canvas; // Reference to canvas for size calculations
        this.textAlign = 'center';
        this.textBaseline = 'middle';
        this.opacity = 0;
        this.isVisible = false;

        // Text effects
        this.shadowColor = 'rgba(0, 0, 0, 0.7)';
        this.shadowBlur = 5;
        this.shadowOffsetX = 2;
        this.shadowOffsetY = 2;
        this.strokeColor = 'black';
        this.strokeWidth = 2;
        this.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        this.padding = 20;
        this.cornerRadius = 15;

        this.reactions = {
            dragStart: [
                "О, поехали!",
                "Так, куда мы тащим эту штуку?",
            ],
            falling: [
                "Летим!",
                "Оп-па!",
                "Гравитация работает!",
                "Эхх так хорошо держалось..."
            ],
            bounce: [
                "Бамс!",
                "Отскок!",
                "Мягкое приземление",
            ],
            idle: [
                "Может подвинем эту штуку?",
                "Загрузка... в прямом смысле",
                "Интересно, что будет если потянуть?"
            ]
        };
        this.lastReactionTime = 0;
        this.reactionCoolDown = 10000;

        // Initialize adaptive font size and high-DPI canvas
        this.setupHighDPI();
        this.updateFontSize();
        window.addEventListener('resize', () => {
            this.setupHighDPI();
            this.updateFontSize();
        });
    }

    // Set up canvas for high-DPI displays
    setupHighDPI() {
        if (!this.canvas) return;
        const ctx = this.canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
    }

    // Update font size based on canvas width and screen resolution
    updateFontSize() {
        if (!this.canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const minFontSize = 14; // Minimum font size to ensure readability
        const scaleFactor = Math.min(this.canvas.width / (600 * dpr), 1.2); // Adjusted for smaller screens
        this.fontSize = Math.max(this.baseFontSize * scaleFactor, minFontSize);
        this.font = `${this.fontSize}px ${this.fontFamily}`;
        // Adapt padding, corner radius, and effects proportionally
        this.padding = 10 * scaleFactor;
        this.cornerRadius = 8 * scaleFactor;
        this.strokeWidth = Math.max(1 * scaleFactor, 1); // Minimum stroke width
        this.shadowBlur = Math.max(3 * scaleFactor, 2); // Minimum shadow blur
    }

    draw(ctx) {
        if (!this.isVisible) return;

        ctx.save();

        // Optimize for high-DPI rendering
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        ctx.globalAlpha = this.opacity;

        // Measure text
        const textWidth = ctx.measureText(this.text).width;
        const textHeight = this.fontSize * 1.2;

        // Background coordinates
        const bgX = this.position.x - textWidth / 2 - this.padding;
        const bgY = this.position.y - textHeight / 2 - this.padding;
        const bgWidth = textWidth + this.padding * 2;
        const bgHeight = textHeight + this.padding * 2;

        // Draw background
        ctx.fillStyle = this.backgroundColor;
        ctx.beginPath();
        ctx.roundRect(bgX, bgY, bgWidth, bgHeight, this.cornerRadius);
        ctx.fill();

        // Simplify effects for smaller screens
        if (this.canvas.width < 400 * (window.devicePixelRatio || 1)) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = Math.max(this.shadowBlur * 0.5, 1);
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = Math.max(this.strokeWidth * 0.5, 0.5);
        } else {
            ctx.shadowColor = this.shadowColor;
            ctx.shadowBlur = this.shadowBlur;
            ctx.shadowOffsetX = this.shadowOffsetX;
            ctx.shadowOffsetY = this.shadowOffsetY;
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;
        }

        // Draw text stroke
        ctx.strokeText(this.text, this.position.x, this.position.y);

        // Draw main text
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.position.x, this.position.y);

        ctx.restore();
    }

    show(duration = 1000) {
        this.isVisible = true;

        const fadeIn = setInterval(() => {
            this.opacity += 0.05;
            if (this.opacity >= 1) clearInterval(fadeIn);
        }, duration / 20);
    }

    hide(duration = 1000) {
        const fadeOut = setInterval(() => {
            this.opacity -= 0.05;
            if (this.opacity <= 0) {
                clearInterval(fadeOut);
                this.isVisible = false;
            }
        }, duration / 20);
    }

    updateText(newText) {
        this.text = newText;
    }
}

