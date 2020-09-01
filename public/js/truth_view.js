function dosanitize(widget) {
  var data = window.event.clipboardData.getData('text');
  widget.value += sanitize(data);
  window.event.preventDefault();
  return false;
}

function sanitize(x) {
  x = x.replace(/\u00AC/gi, "~");
  x = x.replace(/\u2227/gi, "&");
  x = x.replace(/\u2228/gi, "|");
  x = x.replace(/\u21D2/gi, "=>");
  x = x.replace(/\u21D4/gi, "<=>");
  x = x.replace(/\u2200/gi, "A");
  x = x.replace(/\u2203/gi, "E");
  x = x.replace(/\./gi, ":");
  return x.replace(/[^a-z_0-9~&|=>:-\s\x28\x29\,{}]/gi, "");
}

let notebook = document.querySelector(".notebook");
let global_index = 1;

function addNewCell(button_id) {
  var index = button_id[button_id.length - 1];
  global_index += 1;
  var newButtonBarID = 'buttonbar' + global_index.toString();
  var newInputID = 'input' + global_index.toString();
  var newAddID = 'add' + global_index.toString();
  var newCompileID = 'compile' + global_index.toString();
  var newCell = '<p><input id="newInputID" /></p> <div class="conclusion" id="newButtonBarID"> <div class="addNew">' +
    '<button class="add btn btn-light" id="newAddID" type="button" onclick="addNewCell(this.id)">' +
    '<ion-icon name="add-outline"></ion-icon></button>' +
    '<button class="compile btn btn-light" id="newCompileID" type="button" onclick="compileLogic(this.id)">' +
    '<ion-icon name="caret-forward-outline"> </ion-icon></button></div>';
  newCell = newCell.replace('newButtonBarID', newButtonBarID);
  newCell = newCell.replace('newInputID', newInputID);
  newCell = newCell.replace('newAddID', newAddID);
  newCell = newCell.replace('newCompileID', newCompileID);
  document.querySelector('#buttonbar' + index).insertAdjacentHTML('afterend', newCell);
}

function compileLogic(button_id) {
  var index = button_id[button_id.length - 1];
  var premises = document.querySelector('#input' + index).value;
  if (premises == "") {
    return;
  }

  fetch('/truth/generateTable', {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      premises: premises
    })
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Unable to generate truth table");
    }
    response.text().then(text => {
      document.querySelector('#buttonbar' + index).insertAdjacentHTML('beforeend', text);
    });

    return result;
  }).catch((err) => {
    console.log(err);
  });
}


let generate = document.querySelector(".generate"),
  premises = document.querySelector(".premises"),
  result = document.querySelector(".conclusion");

generate.addEventListener('click', function (e) {
  e.preventDefault();
  if (premises.value == "") {
    return;
  }
  result.innerHTML = "";

  fetch('/truth/generateTable', {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      premises: premises.value
    })
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Unable to generate truth table");
    }
    response.text().then(text => {
      console.log(text);
      result.innerHTML = text;
    });

    return result;
  }).catch((err) => {
    console.log(err);
  });
});


function toggleinstructions(toggle) {
  if (toggle.innerHTML == 'Hide Instructions') {
    toggle.innerHTML = 'Show Instructions';
    document.getElementById('instructions').style.display = 'none';
    return true;
  }

  toggle.innerHTML = 'Hide Instructions';
  document.getElementById('instructions').style.display = '';
  return true;
}