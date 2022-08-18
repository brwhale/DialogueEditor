let nodes = [];
let addingChildrenNode = -1;
let draggingNode = -1;

function addNode() {
    nodes.push({id: nodes.length, message: "", hideScript: "", actScript: "", soundFile: "", pos: {x: 100, y: document.querySelector("#nodesBox").clientHeight }, children: []});

    addingChildrenNode = -1;
    drawNodes();
}

function deleteNode(index) {
    nodes.splice(index, 1);
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id > index) {
            nodes[i].id -= 1;
        }
        nodes[i].children.filter(function(item){ return item !== index});
        nodes[i].children.forEach(function(part, idx) {
            if (nodes[i].children[idx] > index) {
                nodes[i].children[idx] -= 1;
            }
          });
    }
}

function connectResponse(parent, child) {
    parent.children.push(child.id);
 }

function setMessage(index, message) {
    nodes[index].message = message;
 }

function setVisibilityScript(index, script) { 
    nodes[index].hideScript = script;
}

function setActivationScript(index, script) { 
    nodes[index].actScript = script;
}

function saveToFile() { }

function loadFromFile() { }

function clickedNode(index) {
    event.stopPropagation();
    if (addingChildrenNode >=0 && addingChildrenNode != index) {
        if (!nodes[addingChildrenNode].children.includes(index)) {
            nodes[addingChildrenNode].children.push(index);
        }
        addingChildrenNode = -1;
        drawNodes();
    }
}

function wantsChild(index) {
    if (addingChildrenNode < 0) {
        event.stopPropagation();
        addingChildrenNode = index;
    }
}

function getArrow(start, end) {
    let padding = 20;
    let miny = Math.min(start.y, end.y);
    let height = Math.max(start.y, end.y) - miny + padding*2;
    let minx = Math.min(start.x, end.x);
    let width = Math.max(start.x, end.x) - minx + padding*2;
    let content = '<svg width="'+width+'" height="'+height+'" style="pointer-events: none;position: absolute;top: ' + (miny-padding) + 'px;left: '+(minx-padding)+'px;">';
    content += '<defs><marker id="arrowtip" markerWidth="13" markerHeight="13" refx="2" refy="6" orient="auto">';
    content += '<path d="M2,2 L2,11 L10,6 L2,2" style="fill:red;" /></marker></defs>';
    content += '<path d="M' + (start.x-minx+padding) + "," + (start.y-miny+padding) + ' L' + (end.x-minx+padding) + "," + (end.y-miny+padding); 
    content += '"style="stroke:red; stroke-width: 1.25px; fill: none; marker-end: url(#arrowtip);"/></svg>';
    return content;
}

function updateMessage(index) {
    nodes[index].message = document.getElementById("message"+index).value;
}

function updateVisScript(index) {
    nodes[index].hideScript = document.getElementById("hideScript"+index).value;
}

function updateActScript(index) {
    nodes[index].actScript = document.getElementById("actScript"+index).value;
}

function updateFile(index) {
    nodes[index].soundFile = document.getElementById("soundFile"+index).value;
}

function mousedownNode(index) {
    event.stopPropagation();
    draggingNode = index;
}

function mouseup() {
    draggingNode = -1;
}

function clearSelections() {
    draggingNode = -1;
    addingChildrenNode = -1;
    document.getElementById("arrow").innerHTML = "";
}

function drawNodes() {
    document.getElementById("arrow").innerHTML = '';
    let selector = document.querySelector("#nodesBox");
    let biggest = {x:0, y:0};
    selector.innerHTML = "";
    nodes.forEach((item, index, array) => {
        if (biggest.x < item.pos.x) {
            biggest.x = item.pos.x;
        }
        if (biggest.y < item.pos.y) {
            biggest.y = item.pos.y;
        }
        let content = "<div id='node"+index+"' class='node absolute' style='top:" + item.pos.y + "px;left:" + item.pos.x + "px;' onclick='clickedNode(" + index + ")'>";
        content += "<p style='display:inline-block;'>Id: " + index + " </p>";
        content += "<a style='display:inline-block;'class='button adder' onclick='wantsChild(" + index + ")'>Add Child</a>";
        content += "<a style='display:inline-block;'class='button mover' onmousedown='mousedownNode(" + index + ")'>Move</a>";
        content += "<textarea id='message"+index+"'class='message' placeholder='Message' onkeyup='updateMessage("+index+")'>";
        content += item.message;
        content += "</textarea>";
        content += "<textarea id='hideScript"+index+"' class='message' placeholder='Visibility Script' onkeyup='updateVisScript("+index+")'>";
        content += item.hideScript;
        content += "</textarea>";
        content += "<textarea id='actScript"+index+"' class='message' placeholder='Activation Script' onkeyup='updateActScript("+index+")'>";
        content += item.actScript;
        content += "</textarea>";
        content += "<input id='soundFile"+index+"' placeholder='Sound File' onkeyup='updateFile("+index+")'>";
        content += item.soundFile;
        content += "</input>";
        content += "</div>";
        selector.innerHTML += content;
      });

      nodes.forEach((item, index, array) => {
        item.children.forEach((c, i, arr) => {
            selector.innerHTML += getArrow({x:item.pos.x + 100, y:item.pos.y + 50}, {x:nodes[c].pos.x + 200, y:nodes[c].pos.y + 50});
        });
      });

      if (biggest.x > 0) {
        selector.style.width = 500+biggest.x+"px";
        selector.style.height = 300+biggest.y+"px";
      }
}

function updateAddArrow(origin, point) {
    document.getElementById("arrow").innerHTML = getArrow(origin, point);
}

addEventListener('mousemove', (event) => {
    if (addingChildrenNode >= 0) {
        let origin = nodes[addingChildrenNode].pos;
        updateAddArrow({x:origin.x + 100, y:origin.y+50}, {x:event.clientX + window.pageXOffset, y:event.clientY + window.pageYOffset });
    } else if (draggingNode >= 0) {
        nodes[draggingNode].pos.x += event.movementX;
        nodes[draggingNode].pos.y += event.movementY;
        drawNodes();
    }
});

addEventListener('mouseup', (event) => {
    mouseup();
});

drawNodes();

function download(content) {
    let a = document.createElement('a');
    let file = new Blob([content], {type: "text/plain"});
    
    a.href= URL.createObjectURL(file);
    a.download = document.getElementById("exportFile").value;
    a.click();
  
    URL.revokeObjectURL(a.href);

    a.remove();
  };

function getJson() {
    return JSON.stringify(nodes);
}

function exportJson() {
    download(getJson());
}

function importFile(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        nodes = JSON.parse(e.target.result);
        drawNodes();
    };
    reader.readAsText(file);
  }
  
document.getElementById('fileImport')
    .addEventListener('change', importFile, false);