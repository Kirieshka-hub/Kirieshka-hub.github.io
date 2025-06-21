// export class LoadBar {
//     constructor({position, color, loadWidth, speed, height = 50, width = 300, ctx, canvHeight}) {
//         this.ctx = ctx;
//         this.canvasHeight = canvHeight;

//         this.position = position;
//         this.width = width;
//         this.height = height;
//         this.color = color;
//         this.speed = speed;
//         this.loadWidth = loadWidth;
//         this.isDragging = false;
//         this.isFall = false;
//         this.gravity = 0.5;

//         this.justBounced = false;
//     }

//     draw() {
//         // Тень для бара
//         this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
//         this.ctx.shadowBlur = 10;
//         this.ctx.shadowOffsetX = 5;
//         this.ctx.shadowOffsetY = 5;
        
//         this.ctx.strokeStyle = 'black';
//         this.ctx.lineWidth = 5;
//         this.ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
        
//         // Градиент для полосы загрузки
//         const gradient = this.ctx.createLinearGradient(
//             this.position.x, 
//             this.position.y, 
//             this.position.x + this.width, 
//             this.position.y
//         );
//         gradient.addColorStop(0, 'lightgreen');
//         gradient.addColorStop(1, this.color);
        
//         this.ctx.fillStyle = gradient;
//         this.ctx.fillRect(this.position.x, this.position.y, this.loadWidth, this.height);
        
//         // Сбрасываем тень
//         this.ctx.shadowColor = 'transparent';
//     }

//     update() {
//         this.draw();

//         if (this.loadWidth <= 180) {
//             this.loadWidth += 0.5; 
//         }
        
//         if (!this.isDragging && this.isFall) {
//             this.speed += this.gravity;
//             this.position.y += this.speed;

//             if (this.position.y + this.height + this.speed >= this.canvasHeight) {
//                 this.speed = -this.speed * 0.6;
//                 this.justBounced = true;
//                 if (Math.abs(this.speed) < 1) {
//                     this.speed = 0;
//                     this.isFall = false;
//                 }
//             }
//         }
//     }

//     startDrag(mouseX, mouseY) {
//         this.isDragging = true;
//         this.dragOffsetX = mouseX - this.position.x;
//         this.dragOffsetY = mouseY - this.position.y;
//     }

//     stopDrag() {
//         this.isDragging = false;
//     }

//     drag(mouseX, mouseY) {
//         if (this.isDragging) {
//             this.position.x = mouseX - this.dragOffsetX;
//             this.position.y = mouseY - this.dragOffsetY;
//         }
//     }
// }