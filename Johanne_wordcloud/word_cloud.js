// List of words

//let myWords = [];
let txt = '';

function wordFreq(words) {
    /*const words = string
        .toLowerCase()
        .replace(/[.]/g, ' ') // Choose to add a whitespace to make sure we are not putting words together. This might split some numbers
        .replace(/,/g, '')
        .replace(/:/g, '')
        .replace(/;/g, '')
        //.replace(/"/g, '')
        .split(/\s/); */

    const freqMap = {};
    words.forEach(function (w) {
        if (!freqMap[w]) {
            freqMap[w] = 0;
        }
        freqMap[w] += 1;
    });
    return freqMap;
};


async function fetchData() {
    
    const response = await fetch('text-en_clean/4.txt');
    const text = await response.text();

    txt += text;
    const myWords = txt.toLowerCase()
        .replace(/[.]/g, ' ')
        .replace(/,/g, '')
        .replace(/:/g, '')
        .replace(/;/g, '')
        .split(/\s/);
    
    var freqmap = wordFreq(myWords);


    // filter frequencies and make JSON object
    const freqmapFiltered = {};
    Object.keys(freqmap).forEach(function (word) {
      // We don't want the string "", nor any numbers in the word cloud.
      if (word === "" || /^[0-9]+$/.test(word)) {
        console.log('Removing', word);
        return;
      }
      if (freqmap[word] > 2) {
        freqmapFiltered[word] = freqmap[word];
      } // choose what frequencies to cut
    });
    // MAKE WORD CLOUD
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 10, bottom: 10, left: 10 },
        width = 450 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Constructs a new cloud layout instance
    var layout = d3.layout.cloud()
        .size([width, height])
        .words(Object.keys(freqmapFiltered).map(function (word) { return { text: word }; }))
        .padding(10)
        .fontSize(function (d) { return 2 * freqmapFiltered[d.text]; })
        .on("end", draw);

    layout.start();

    // This function takes the output of 'layout' above and draw the words
    function draw(freqmap) {
        svg.append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(freqmap)
            .enter().append("text")
            .style("font-size", function (d) { return d.size + "px"; })
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) { return d.text; });

}
};
fetchData();

/*
// List of words
var myWords = [{word: "Running", size: "100"}, {word: "Surfing", size: "200"}, {word: "Climbing", size: "50"}, {word: "Kiting", size: "30"}, {word: "Sailing", size: "20"}, {word: "Snowboarding", size: "60"} ]

// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 450 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
// Wordcloud features that are different from one word to the other must be here
var layout = d3.layout.cloud()
  .size([width, height])
  .words(myWords.map(function(d) { return {text: d.word, size:d.size}; }))
  .padding(1)        //space between words
  .rotate(function() { return ~~(Math.random() * 2) * 90; })
  .fontSize(function(d) { return d.size; })      // font size of words
  .on("end", draw);
layout.start();

// This function takes the output of 'layout' above and draw the words
// Wordcloud features that are THE SAME from one word to the other can be here
function draw(words) {
  svg
    .append("g")
      .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size; })
        .style("fill", "#69b3a2")
        .attr("text-anchor", "middle")
        .style("font-family", "Impact")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
}; */