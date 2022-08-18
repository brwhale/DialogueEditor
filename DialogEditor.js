let nodes = [];
let addingChildrenNode = -1;
let draggingNode = -1;
let resizeMode = false;

function addNode() {
    nodes.push({id: nodes.length, message: "", hideScript: "", actScript: "", soundFile: "", width: 400, pos: {x: 100+nodes.length, y: document.querySelector("#nodesBox").clientHeight }, children: []});

    addingChildrenNode = -1;
    drawNodes();
}

function deleteNode(index) {
    nodes.splice(index, 1);
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id > index) {
            nodes[i].id -= 1;
        }
        nodes[i].children = nodes[i].children.filter(function(item){ return item != index; });
        nodes[i].children.forEach(function(part, idx) {
            if (nodes[i].children[idx] > index) {
                nodes[i].children[idx] -= 1;
            }
          });
    }
    drawNodes();
}

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
    let color = "red";
    let content = '<svg width="'+width+'" height="'+height+'" style="pointer-events: none;position: absolute;top: ' + (miny-padding) + 'px;left: '+(minx-padding)+'px;">';
    content += '<defs><marker id="arrowtip" markerWidth="13" markerHeight="13" refx="2" refy="6" orient="auto">';
    content += '<path d="M2,2 L2,11 L10,6 L2,2" style="fill:'+color+';" /></marker></defs>';
    content += '<path d="M' + (start.x-minx+padding) + "," + (start.y-miny+padding) + ' L' + (end.x-minx+padding) + "," + (end.y-miny+padding); 
    content += '"style="stroke:'+color+'; stroke-width: 1.25px; fill: none; marker-end: url(#arrowtip);"/></svg>';
    return content;
}

function updateMessage(index, elem) {
    nodes[index].message = elem.value;
    if (textAreaAdjust(elem)) {
        drawArrows();
    }
}

function updateVisScript(index, elem) {
    nodes[index].hideScript = elem.value;
    if (textAreaAdjust(elem)) {
        drawArrows();
    }
}

function updateActScript(index, elem) {
    nodes[index].actScript = elem.value;
    if (textAreaAdjust(elem)) {
        drawArrows();
    }
}

function updateFile(index, elem) {
    nodes[index].soundFile = elem.value;
}

function mousedownNode(index) {
    event.stopPropagation();
    draggingNode = index;
    resizeMode = false;
}

function resizeNode(index) {
    event.stopPropagation();
    draggingNode = index;
    resizeMode = true;
}

function mouseup() {
    draggingNode = -1;
}

function clearSelections() {
    draggingNode = -1;
    addingChildrenNode = -1;
    document.getElementById("arrow").innerHTML = "";
}

function textAreaAdjust(element) {
    let oldh = element.style.height;
    element.style.height = "1px";
    element.style.height = (25+element.scrollHeight)+"px";
    return element.style.height != oldh;
  }

function sortNodes() {
    let alreadyMoved = [];
    let usedPositions = [];
    let y = 40;
    let h = 500;
    nodes.forEach((item, index, array) => {
        item.children.forEach((c, i, arr) => {
            if (!c) return;
            if (!alreadyMoved.includes(c)) {
                alreadyMoved.push(c);
                let pos = {x:i * 500 + item.pos.x, y: h + item.pos.y};
                while (usedPositions.some(e => e.x == pos.x && e.y == pos.y)) {
                    pos.x += 500;
                }
                usedPositions.push(pos);
                nodes[c].pos.x = pos.x;
                nodes[c].pos.y = pos.y;
            }
        });
      });
    drawNodes();
}

function drawArrows() {
    document.querySelector("#arrow").innerHTML = ''; // clear temp arrow
    let selector = document.querySelector("#arrows");
    selector.innerHTML = '';
    nodes.forEach((item, index, array) => {
        let elem = document.getElementById("node"+index);
        let origin = {x:item.pos.x + elem.clientWidth - 20, y:item.pos.y + elem.clientHeight};
        item.children.forEach((c, i, arr) => {
            selector.innerHTML += getArrow(origin, {x:nodes[c].pos.x + 200, y:nodes[c].pos.y + 50});
        });
      });
}

function drawNodes() {
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
        content += "<a style='display:inline-block;float:right;'class='button stretcher' onmousedown='resizeNode(" + index + ")'>Resize</a>";
        content += "<a style='display:inline-block;float:right;'class='button mover' onmousedown='mousedownNode(" + index + ")'>Move</a>";
        content += "<textarea id='message"+index+"'class='message' style='width: "+item.width+"px;' placeholder='Message' onkeyup='updateMessage("+index+", this)'>";
        content += item.message;
        content += "</textarea>";
        content += "<textarea id='hideScript"+index+"' class='message' style='width: "+item.width+"px;' placeholder='Visibility Script' onkeyup='updateVisScript("+index+", this)'>";
        content += item.hideScript;
        content += "</textarea>";
        content += "<textarea id='actScript"+index+"' class='message' style='width: "+item.width+"px;' placeholder='Activation Script' onkeyup='updateActScript("+index+", this)'>";
        content += item.actScript;
        content += "</textarea>";
        content += "<input id='soundFile"+index+"' class='message' placeholder='Sound File' onkeyup='updateFile("+index+", this)' value='";
        content += item.soundFile;
        content += "'/>";
        content += "<a style='display:inline-block;'class='button deleter' onclick='deleteNode(" + index + ")'>Delete</a>";
        content += "<a style='display:inline-block;float: right;'class='button adder' onclick='wantsChild(" + index + ")'>Add Child</a>";
        content += "</div>";
        selector.innerHTML += content;
      });

      document.querySelectorAll(".message").forEach((item) => {
        textAreaAdjust(item);
      });

      if (biggest.x > 0) {
        selector.style.width = 500+biggest.x+"px";
        selector.style.height = 400+biggest.y+"px";
      }

      drawArrows();
}

function updateAddArrow(origin, point) {
    document.getElementById("arrow").innerHTML = getArrow(origin, point);
}

addEventListener('mousemove', (event) => {
    if (addingChildrenNode >= 0) {
        let origin = nodes[addingChildrenNode].pos;
        let elem = document.getElementById("node"+addingChildrenNode);
        updateAddArrow({x:origin.x + elem.clientWidth - 20, y:origin.y+elem.clientHeight}, {x:event.clientX + window.pageXOffset, y:event.clientY + window.pageYOffset });
    } else if (draggingNode >= 0) {
        if (resizeMode) {
            nodes[draggingNode].width += event.movementX;
        } else {
            nodes[draggingNode].pos.x += event.movementX;
            nodes[draggingNode].pos.y += event.movementY;
        }
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

function repairNodeMetadata() {
    nodes.forEach((item, index, array) => {
        if (!item.pos) {
            item.pos = {x:100+index, y:index*350};
        }
        if (!item.width) {
            item.width = 400;
        }
      });
}

function importFile(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        nodes = JSON.parse(e.target.result);
        repairNodeMetadata();
        drawNodes();
    };
    reader.readAsText(file);
  }
  
document.getElementById('fileImport')
    .addEventListener('change', importFile, false);