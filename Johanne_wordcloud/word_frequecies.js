function wordFreq(string) {
    var words = string
        .toLowerCase()
        .replace(/[.]/g, ' ') // Choose to add a whitespace to make sure we are not putting words together. This might split some numbers
        .replace(/,/g, '')
        .replace(/:/g, '')
        .replace(/;/g, '')
        //.replace(/"/g, '')
        .split(/\s/);

    var freqMap = {};
    words.forEach(function(w) {
        if (!freqMap[w]) {
            freqMap[w] = 0;
        }
        freqMap[w] += 1;
    });

    return freqMap;
}


const freq = document.getElementById('wf');
fetch('text-en_clean/4.txt')
    .then(response => response.text())
    .then(text => {
        freq.textContent += JSON.stringify(wordFreq(text)); // json.stringify
            }); 