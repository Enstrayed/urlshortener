function buttonCopyResult() {
    navigator.clipboard.writeText(document.getElementById("resultfield").innerHTML)
}

function buttonFillFromClipboard() {
    navigator.clipboard.readText().then(res => {
        document.getElementById("valuefield").value = res;
    })
}

function buttonFillSuicide() {
    document.getElementById("urlfield").value = "suicide";
}

function makeRandomHex(length) {
    let result = '';
    const characters = '0123456789abcdef';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function buttonFillRandom() {
    document.getElementById("urlfield").value = makeRandomHex(6);
}

function updateResultField(content) {
    document.getElementById("resultfield").innerHTML = content;
}

function buttonPostRequest() {
    fetch(`http://localhost:8128/${document.getElementById("urlfield").value}?auth=${document.getElementById("authfield").value}&url=${document.getElementById("valuefield").value}`, {method: 'POST'}).then(res => {
        res.body.text().then(s => {updateResultField(s);})
        
    })
}

function buttonDeleteRequest() {
    fetch(`http://localhost:8128/${document.getElementById("urlfield").value}?auth=${document.getElementById("authfield").value}`, {method: 'DELETE'}).then(res => {
        updateResultField(res.status);
    })
}