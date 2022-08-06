let nodes = [];

function addNode() {
    nodes.push({message: "", visScript: "", actScript: ""});

    drawNodes();
}

function connectResponse(parent, child) { }

function setMessage(index, message) { }

function setVisibilityScript(index, script) { }

function setActivationScript(index, script) { }

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
