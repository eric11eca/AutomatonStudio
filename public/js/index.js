const canvas = document.querySelector('canvas');
const generateButton = document.querySelector('.generate-tree-button');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
let curve = 10;
let curve2 = 0;

function drawTree(startX, startY, len, angle, branchWidth, color1, color2) {
  ctx.beginPath();
  ctx.save();
  ctx.strokeStyle = color1;
  ctx.fillStyle = color2;
  ctx.lineWidth = branchWidth;
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'black';
  ctx.translate(startX, startY);
  ctx.rotate(angle * Math.PI / 180);
  ctx.moveTo(0, 0);

  if (angle > 0) {
    ctx.bezierCurveTo(curve2, -len / 2, curve2, -len / 2, 0, -len);
  } else {
    ctx.bezierCurveTo(curve2, -len / 2, -curve2, -len / 2, 0, -len);
  }

  ctx.stroke();

  if (len < 10) {
    ctx.beginPath();
    ctx.arc(0, -len, 10, 0, Math.PI / 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  curve = (Math.random() * 10) + 10;

  drawTree(0, -len, len * 0.77, angle + curve, branchWidth * 0.6);
  drawTree(0, -len, len * 0.77, angle - curve, branchWidth * 0.6);

  ctx.restore();
}

drawTree(canvas.width / 2, canvas.height - 80, 120, 0, 25, 'brown', 'pink');

let framesPerSecond = 1;

function generateRandomTree() {
  setTimeout(function () {
    requestAnimationFrame(generateRandomTree);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let centerPointX = canvas.width / 2;
    let len = Math.floor((Math.random() * 20) + 140);
    let angle = 0;
    let branchWidth = (Math.random() * 60) + 1;
    let color1 = 'rgb(' + Math.random() * 255 + ',' + Math.random() * 255 + ',' + Math.random() * 255 + ')';
    let color2 = 'rgb(' + Math.random() * 255 + ',' + Math.random() * 255 + ',' + Math.random() * 255 + ')';

    //generateButton.style.background = color1;
    curve = (Math.random() * 25) + 3;
    curve2 = (Math.random() * 10) + 3;
    drawTree(centerPointX, canvas.height - 80, len, angle, branchWidth, color1, color2);

  }, 1000 / framesPerSecond);
}

window.requestAnimationFrame(generateRandomTree);

//generateButton.addEventListener('click', generateRandomTree);
window.addEventListener('resize', function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});