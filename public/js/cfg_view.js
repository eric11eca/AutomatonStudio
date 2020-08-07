let divider_y = document.querySelector('.divider-y'),
  wrapper_y = divider_y.closest('.main-content'),
  box_y = wrapper_y.querySelector('.leftPanel'),
  isDividerYDragged = false;

let divider_x = document.querySelector('#left-divider');
var wrapper_x = divider_x.closest('.resize-box');
var box_x = wrapper_x.querySelector('#cfg-raw');
var isDividerXDragged = false;

document.addEventListener('mousedown', function (e) {
  if (e.target === divider_y) {
    isDividerYDragged = true;
  } else if (e.target === divider_x) {
    isDividerXDragged = true;
  }
});

document.addEventListener('mousemove', function (e) {
  e.preventDefault();
  if (isDividerYDragged) {
    divider_vertival_handler(e);
  } else if (isDividerXDragged) {
    divider_horizontal_handler(e);
  }
});

document.addEventListener('mouseup', function (e) {
  isDividerYDragged = false;
  isDividerXDragged = false;
});

function divider_vertival_handler(e) {
  console.log("handle vertical slider");
  var containerOffsetLeft = wrapper_y.offsetLeft;
  var pointerRelativeXpos = e.clientX - containerOffsetLeft;
  var boxAminWidth = 60;

  box_y.style.width = (Math.max(boxAminWidth, pointerRelativeXpos - 8)) + 'px';
  box_y.style.flexGrow = 0;
}

function divider_horizontal_handler(e) {
  console.log("handle horizontal slider");
  var containerOffsetTop = wrapper_x.offsetTop;
  var pointerRelativeYpos = e.clientY - containerOffsetTop;
  var boxMinHeight = 60;

  box_x.style.height = (Math.max(boxMinHeight, pointerRelativeYpos - 8)) + 'px';
  box_x.style.flexGrow = 0;
}

let editor = ace.edit("cfg-input");
editor.setTheme("ace/theme/nord_dark");
editor.session.setMode("ace/mode/text");

editor.setOptions({
  autoScrollEditorIntoView: true,
  copyWithEmptySelection: true,
  "mergeUndoDeltas": "always",
});