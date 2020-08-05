let divider_y = document.querySelector('.divider-y'),
  wrapper_y = divider_y.closest('.main-content'),
  box_y = wrapper_y.querySelector('.leftPanel'),
  isDividerYDragged = false;

let divider_x = document.querySelector('#left-divider');
let divider_x_right = document.querySelector('#right-divider');
var wrapper_x = divider_x.closest('.resize-box');
var wrapper_x_right = divider_x_right.closest('.resize-box');
var box_x = wrapper_x.querySelector('#cfg-raw');
var box_x_right = wrapper_x_right.querySelector('#cfg-right');
var isDividerXDragged = false;
var isDividerXDraggedRight = false;

document.addEventListener('mousedown', function (e) {
  if (e.target === divider_y) {
    isDividerYDragged = true;
  } else if (e.target === divider_x) {
    isDividerXDragged = true;
  } else if (e.target === divider_x_right){
      isDividerXDraggedRight = true;
  }
});

document.addEventListener('mousemove', function (e) {
  e.preventDefault();
  if (isDividerYDragged) {
    divider_vertival_handler(e);
  } else if (isDividerXDragged) {
    divider_horizontal_handler(e,true);
  } else if (isDividerXDraggedRight){
    divider_horizontal_handler(e,false);
  }
});

document.addEventListener('mouseup', function (e) {
  isDividerYDragged = false;
  isDividerXDragged = false;
  isDividerXDraggedRight = false;
});

function divider_vertival_handler(e) {
  console.log("handle vertical slider");
  var containerOffsetLeft = wrapper_y.offsetLeft;
  var pointerRelativeXpos = e.clientX - containerOffsetLeft;
  var boxAminWidth = 60;

  box_y.style.width = (Math.max(boxAminWidth, pointerRelativeXpos - 8)) + 'px';
  box_y.style.flexGrow = 0;
}

function divider_horizontal_handler(e, isleft) {
  console.log("handle horizontal slider");
  var wrapper = 0;
  var box = 0;
  if(isleft){
    wrapper = wrapper_x;
    box = box_x;
  }else{
      wrapper = wrapper_x_right;
      box = box_x_right;
  }
var containerOffsetTop = wrapper.offsetTop;
  
  var pointerRelativeYpos = e.clientY - containerOffsetTop;
  var boxMinHeight = 60;

  box.style.height = (Math.max(boxMinHeight, pointerRelativeYpos - 8)) + 'px';
  box.style.flexGrow = 0;
}