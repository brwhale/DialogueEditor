let nodes = [];

function addNode() {
    nodes.push({id: nodes.length, message: "", hideScript: "", actScript: "", children: []});

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

function drawNodes() {
    let selector = document.querySelector("p");
    selector.innerHTML = "";
    nodes.forEach((item, index, array) => {
        selector.innerHTML += index.toString() + ", " + JSON.stringify(item) + "</br>";
      });
}

drawNodes();
