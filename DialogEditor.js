let nodes = [];
let addingChildrenNode = -1;
let draggingNode = -1;
let resizeMode = false;
let minDist = 250;

function getNewNodePlacement() {
    let usedPositions = [];
    let size = {x:400, y:200};
    nodes.forEach((item, index, array) => {
        usedPositions.push(item.pos);
        size.x = Math.max(size.x, item.pos.x + 400);
        size.y = Math.max(size.y, item.pos.y + 200);
    });
    let h = 500;
    let pos = ({x:Math.max(200,window.scrollX), y:window.scrollY});
    let colMode = true;
    while (usedPositions.some(e => Math.abs(e.x - pos.x) < minDist && Math.abs(e.y - pos.y) < minDist)) {
        if (colMode) {
            pos.y += h;
            if (pos.y > size.y) {
                colMode = false;
                pos.y -= h;
            }
        } else {
            pos.x += h;
            if (pos.x + h > Math.max(size.x, window.innerWidth)) {
                pos.x = 200;
                pos.y += h;
                colMode = true;
            }
        }
    }
    return pos;
}

function addNode() {
    nodes.push({id: nodes.length, color: 0, message: "", hideScript: "", actScript: "", soundFile: "", width: 400, pos: getNewNodePlacement(), children: []});

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

function clearNodes() {
    clearSelections();
    nodes = [];
    let selector = document.getElementById("nodesBox");
    selector.style.width = "800px";
    selector.style.height = "800px";
    drawNodes();
}

function clickedNode(index) {
    event.stopPropagation();
    if (addingChildrenNode >=0 && addingChildrenNode != index && (!nodes[index].color || nodes[index].color != nodes[addingChildrenNode].color)) {
        if (!nodes[addingChildrenNode].children.includes(index)) {
            if (!nodes[addingChildrenNode].color) {
                nodes[addingChildrenNode].color = 1;
            }
            nodes[addingChildrenNode].children.push(index);
            nodes[index].color = nodes[addingChildrenNode].color *-1;
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

function deleteChildren(index) {
    nodes[index].children.length = 0;
    drawArrows();
}

function getArrow(start, end) {
    let padding = 20;
    let miny = Math.min(start.y, end.y);
    let height = Math.max(start.y, end.y) - miny + padding*2;
    let minx = Math.min(start.x, end.x);
    let width = Math.max(start.x, end.x) - minx + padding*2;
    let color = end.y > start.y ? "red" : "blue";
    let arrowtipid = "arrowtip_" + color;
    let content = '<svg width="'+width+'" height="'+height+'" style="pointer-events: none;position: absolute;top: ' + (miny-padding) + 'px;left: '+(minx-padding)+'px;">';
    content += '<defs><marker id="'+arrowtipid+'" markerWidth="13" markerHeight="13" refx="2" refy="6" orient="auto">';
    content += '<path d="M2,2 L2,11 L10,6 L2,2" style="fill:'+color+';" /></marker></defs>';
    content += '<path d="M' + (start.x-minx+padding) + "," + (start.y-miny+padding) + ' L' + (end.x-minx+padding) + "," + (end.y-miny+padding); 
    content += '"style="stroke:'+color+'; stroke-width: 1.25px; fill: none; marker-end: url(#'+arrowtipid+');"/></svg>';
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
    element.style.height = (10+element.scrollHeight)+"px";
    return element.style.height != oldh;
}

function colorChildren(node, color) {
    if (node.color == 0) {
        node.color = color;
        node.children.forEach((c, index, array) => {
            colorChildren(nodes[c], color *-1);           
        });
    }
}

function recolorNodes() {
    nodes.forEach((item, index, array) => {
        item.color = 0;
    });
    if (nodes.length) {
        if (nodes[0].color == 0) {
            colorChildren(nodes[0], 1);
        }
    }
}

function sortChildren(item, alreadyMoved, usedPositions) {
    let h = 500;
    item.children.forEach((c, i, arr) => {
        if (!c) return;
        if (!alreadyMoved.includes(c)) {
            alreadyMoved.push(c);
            let pos = {x:i * h + item.pos.x, y: h + item.pos.y};
            while (usedPositions.some(e => Math.abs(e.x - pos.x) < minDist && Math.abs(e.y - pos.y) < minDist)) {
                pos.x += h;
            }
            usedPositions.push(pos);
            nodes[c].pos.x = pos.x;
            nodes[c].pos.y = pos.y;
            sortChildren(nodes[c], alreadyMoved, usedPositions);
        }
    });
}

function sortNodes() {
    let alreadyMoved = [];
    let usedPositions = [];
    let y = 40;
    let h = 500;
    nodes.forEach((item, index, array) => {
        if (!alreadyMoved.includes(index)) {
            alreadyMoved.push(index);
            while (usedPositions.some(e => Math.abs(e.x - item.pos.x) < 200 && Math.abs(e.y - item.pos.y) < 200)) {
                item.pos.x += h;
            }
            usedPositions.push(item.pos);
        }
        sortChildren(item, alreadyMoved, usedPositions);
      });
    recolorNodes();
    drawNodes();
}

function drawArrows() {
    document.getElementById("arrow").innerHTML = ''; // clear temp arrow
    let selector = document.getElementById("arrows");
    let content = '';
    nodes.forEach((item, index, array) => {
        let elem = document.getElementById("node"+index);
        let origin = {x:item.pos.x + elem.clientWidth - 20, y:item.pos.y + elem.clientHeight};
        item.children.forEach((c, i, arr) => {
            content += getArrow(origin, {x:nodes[c].pos.x + 200, y:nodes[c].pos.y + 50});
        });
      });
    selector.innerHTML = content;
}

function drawNodes() {
    let biggest = {x:0, y:0};
    let content = "";
    nodes.forEach((item, index, array) => {
        if (biggest.x < item.pos.x) {
            biggest.x = item.pos.x;
        }
        if (biggest.y < item.pos.y) {
            biggest.y = item.pos.y;
        }
        let classes = 'node absolute';
        if (item.color < 0) {
            classes += ' alt-color';
        } else if (item.color > 0) {
            classes += ' alt-color2';
        }
        content += "<div id='node"+index+"' class='"+classes+"' style='top:" + item.pos.y + "px;left:" + item.pos.x + "px;' onclick='clickedNode(" + index + ")'>";
        content += "<div class='toprow mover' onmousedown='mousedownNode(" + index + ")'>";
        content += "<p class='idlabel' style='display:inline-block;'>Id: " + index + " </p>";
        content += "<a style='display:inline-block;float:right;'class='button stretcher' onmousedown='resizeNode(" + index + ")'>Resize</a>";
        content += "</div>";
        content += "<textarea id='message"+index+"'class='message' style='width: "+item.width+"px;' placeholder='Message' onkeyup='updateMessage("+index+", this)'>";
        content += item.message;
        content += "</textarea>";
        content += "<textarea id='hideScript"+index+"' class='message' style='width: "+item.width+"px;' placeholder='Visibility Script' onkeyup='updateVisScript("+index+", this)'>";
        content += item.hideScript;
        content += "</textarea>";
        content += "<textarea id='actScript"+index+"' class='message' style='width: "+item.width+"px;' placeholder='Activation Script' onkeyup='updateActScript("+index+", this)'>";
        content += item.actScript;
        content += "</textarea>";
        content += "<input id='soundFile"+index+"' class='message' style='width: "+item.width+"px;' placeholder='Sound File' onkeyup='updateFile("+index+", this)' value='";
        content += item.soundFile;
        content += "'/>";
        content += "<a style='display:inline-block;'class='button deleter' onclick='deleteNode(" + index + ")'>Delete</a>";
        content += "<a style='display:inline-block;float: right;'class='button adder' onclick='wantsChild(" + index + ")'>Add Child</a>";
        content += "<a style='display:inline-block;float: right;'class='button deleter' onclick='deleteChildren(" + index + ")'>Clear Children</a>";
        content += "</div>";
      });

      let selector = document.getElementById("nodesBox");
      selector.innerHTML = content;

      document.querySelectorAll(".message").forEach((item) => {
        textAreaAdjust(item);
      });

      if (biggest.x > 0) {
        selector.style.width = 800+biggest.x+"px";
        selector.style.height = 800+biggest.y+"px";
      }

      drawArrows();
}

function updateAddArrow(origin, point) {
    document.getElementById("arrow").innerHTML = getArrow(origin, point);
}

function listFuncs() {
    let map = {};
    let regex = /\w+(?=\([^\)]*\))/gm;

    nodes.forEach((item, index, array) => {
        let search = item.hideScript + item.actScript;
        let matches = [...search.matchAll(regex)];
        matches.forEach((match) => {
            if (!map[match]) {
                map[match] = 1;
            } else {
                map[match]++;
            }
        });
    });

    let content = '';

    for (const p in map) {
        content += p + ' : ' + map[p] + " calls\n";
    }
    
    document.getElementById("funcsList").value = content;
}

function download(content) {
    let a = document.createElement('a');
    let file = new Blob([content], {type: "text/plain"});
    
    a.href= URL.createObjectURL(file);
    a.download = document.getElementById("exportFile").value;
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
}

function getJson() {
    return JSON.stringify(nodes, null, '\t');
}

function exportJson() {
    download(getJson());
}

function repairNodeMetadata() {
    let needsSorting = false;
    nodes.forEach((item, index, array) => {
        if (!item.pos) {
            item.pos = {x:100+index, y:index*350};
            needsSorting = true;
        }
        if (!item.width) {
            item.width = 400;
        }
        if (typeof item.message == 'undefined') {
            item.message = "";
        }
        if (typeof item.actScript == 'undefined') {
            item.actScript = "";
        }
        if (typeof item.hideScript == 'undefined') {
            item.hideScript = "";
        }
        if (typeof item.soundFile == 'undefined') {
            item.soundFile = "";
        }
        if (typeof item.color == 'undefined') {
            item.color = 0;
        }
    });
    return needsSorting;
}

function importFile(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    document.getElementById("exportFile").value = file.name;
    var reader = new FileReader();
    reader.onload = function(e) {
        nodes = JSON.parse(e.target.result);
        if (repairNodeMetadata()) {
            sortNodes();
        }
        drawNodes();
    };
    reader.readAsText(file);
}
  
document.getElementById('fileImport').addEventListener('change', importFile, false);

addEventListener('mousemove', (event) => {
    if (addingChildrenNode >= 0) {
        let origin = nodes[addingChildrenNode].pos;
        let elem = document.getElementById("node"+addingChildrenNode);
        updateAddArrow({x:origin.x + elem.clientWidth - 20, y:origin.y+elem.clientHeight}, {x:event.clientX + window.pageXOffset, y:event.clientY + window.pageYOffset });
    } else if (draggingNode >= 0) {
        let elem = document.getElementById("node"+draggingNode);
        if (resizeMode) {
            nodes[draggingNode].width += event.movementX;
            if (nodes[draggingNode].width < 400) {
                nodes[draggingNode].width = 400;
            }
            elem.style.width = nodes[draggingNode].width + "px";
            let ew = "calc(" + elem.style.width + " - 3em)";
            Array.from(elem.getElementsByClassName("message")).forEach((e) => {
                e.style.width = ew;
            });
        } else {
            nodes[draggingNode].pos.x += event.movementX;
            nodes[draggingNode].pos.y += event.movementY;
            elem.style.top = nodes[draggingNode].pos.y + "px";
            elem.style.left = nodes[draggingNode].pos.x + "px";
        }
        
        drawArrows();
    }
});

addEventListener('mouseup', (event) => {mouseup();});

drawNodes();