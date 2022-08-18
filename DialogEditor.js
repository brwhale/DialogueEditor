let nodes = [];
let addingChildrenNode = -1;

function addNode() {
    nodes.push({id: nodes.length, message: "", hideScript: "", actScript: "", soundFile: "", pos: {x: 100, y: 200 * nodes.length}, children: []});

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
    console.log("clicked " + index);
    if (addingChildrenNode >=0 && addingChildrenNode != index) {
        nodes[addingChildrenNode].children.push(index);
        addingChildrenNode = -1;
        drawNodes();
    }
}

function wantsChild(index) {
    addingChildrenNode = index;
    console.log("wantsChild " + index);
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
    console.log(content);
    return content;
}

function drawNodes() {
    document.getElementById("arrow").innerHTML = '';
    let selector = document.querySelector("#nodesBox");
    selector.innerHTML = "";
    nodes.forEach((item, index, array) => {
        let content = "<div class='node absolute' style='top:" + item.pos.y + "px;left:" + item.pos.x + "px;' onclick='clickedNode(" + index + ")'>";
        content += "<p>" + index.toString() + "</p>";
        content += "<a class='button' onclick='wantsChild(" + index + ")'>Add Child</a>";
        content += "<textarea class='message' placeholder='Message'>";
        content += item.message;
        content += "</textarea>";
        content += "<textarea class='message' placeholder='Visibility Script'>";
        content += item.hideScript;
        content += "</textarea>";
        content += "<textarea class='message' placeholder='Activation Script'>";
        content += item.actScript;
        content += "</textarea>";
        content += "<input placeholder='Sound File'>";
        content += item.soundFile;
        content += "</input>";
        content += "</div>";
        selector.innerHTML += content;
      });

      nodes.forEach((item, index, array) => {
        item.children.forEach((c, i, arr) => {
            selector.innerHTML += getArrow({x:item.pos.x + 100, y:item.pos.y + 130}, {x:nodes[c].pos.x + 200, y:nodes[c].pos.y + 50});
        });
        
      });
}

function updateAddArrow(origin, point) {
    document.getElementById("arrow").innerHTML = getArrow(origin, point);
}

addEventListener('mousemove', (event) => {
    if (addingChildrenNode >= 0) {
        let origin = nodes[addingChildrenNode].pos;
        updateAddArrow({x:origin.x + 100, y:origin.y+130}, {x:event.clientX, y:event.clientY});
    }
});

drawNodes();
