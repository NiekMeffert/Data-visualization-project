async function fetchData() 
{
    const response = await fetch('word_counts1.json');
    const jsonData = await response.json();

    // Combine word frequencies from all files
    const freqmap = {};
    Object.keys(jsonData.words).forEach(word => 
        {
        const wordData = jsonData.words[word];
        freqmap[word] = wordData.count;
        });

    // Sort the word frequencies in descending order
    const sortedFreq = Object.keys(freqmap).sort((a, b) => freqmap[b] - freqmap[a]);

    // MAKE WORD CLOUD
    // set the dimensions and margins of the graph
    var margin = { top: 5, right: 5, bottom: 5, left: 5 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg2 = d3.select("#my_dataviz").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        

    // Constructs a new cloud layout instance
    var layout = d3.layout.cloud()
        .size([width, height])
        
        .words(sortedFreq.map(function (word) 
        {
            return { text: word, size: freqmap[word] };
        }))
        .padding(10)
        
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .fontSize(function (d) { return 0.5 * d.size + 10; })
        .on("end", draw);

    layout.start();

    // This function takes the output of 'layout' above and draws the words
    function draw(freqmap) 
    {
        svg2.append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .attr("id", "Wordcloud")
            .selectAll("text")
            .data(freqmap)
            .enter().append("text")
            .style("font-size", function (d) { return d.size + "px"; })
            .attr("text-anchor", "middle")
            .attr("transform", function (d) 
            {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) { return d.text; });
    }
}

fetchData();
