async function fetchData() {
    const response = await fetch('word_counts.json');
    const jsonData = await response.json();

    // Combine word frequencies from all texts
    const freqmap = jsonData.words.reduce((combinedFreqmap, textData) => {
        Object.keys(words).forEach(word => {
            if (!combinedFreqmap[word]) {
                combinedFreqmap[word] = 0;
            }
            combinedFreqmap[word] += word[count];
        });
        console.log(combinedFreqmap)
        return combinedFreqmap;
    });


    const freqMap = {};
    words.forEach(function (w) {
        if (!freqMap[w]) {
            freqMap[w] = 0;
        }
        freqMap[w] += 1;
    });
    return freqMap;
};


    // MAKE WORD CLOUD
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 10, bottom: 10, left: 10 },
        width = 450 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Constructs a new cloud layout instance
    var layout = d3.layout.cloud()
        .size([width, height])
        .words(Object.keys(freqmap).map(function (word) {
            return { text: word, size: freqmap[word] };
        }))
        .padding(10)
        .fontSize(function (d) { return 2 * d.size; })
        .on("end", draw);

    layout.start();

    // This function takes the output of 'layout' above and draws the words
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
}

fetchData();
