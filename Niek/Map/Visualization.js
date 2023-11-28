(function() {
    var margin = { top:50, left:50, right:50, bottom:50},
    height = 700 - margin.top - margin.bottom,
    width = 1400 - margin.left - margin.right;

    var svg = d3.select("#map")
    .append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    d3.queue()
    .defer(d3.json, "world.topojson")
    .defer(d3.csv, "capitals.csv")
    .await(ready)


    var projection = d3.geoMercator()
    .translate ([ width / 2, height / 2])
    .scale(120)


    var path = d3.geoPath()
    .projection(projection)

    function ready (error, data, capitals) 
    {
        console.log(data)

        var countries = topojson.feature(data, data.objects.countries).features

        console.log(countries)

        svg.selectAll(".country")
        .data(countries)
        .enter() .append("path")
        .attr("class" , "country")
        .attr("d" , path)


        .on('mouseover' , function(d) 
        {
            d3.select(this).classed("selected" , true)
        })

        .on('mouseout' , function(d) 
        {
            d3.select(this).classed("selected" , false)
        })
        

        svg.selectAll(".city-circle")
        .data(capitals)
        .enter().append("circle")
        .attr("r" , 2)
        .attr("cx" , function(d)
        {
            var coords = projection ([d.long, d.lat])
            return coords[0];
        })

        .attr("cy" , function(d)
        {
            var coords = projection ([d.long, d.lat])
            return coords[1];
        })

        svg.selectAll(".city-label")
        .data(capitals)
        .enter().append("text")
        .attr("class" , "city-label")
        .attr("x" , function(d)
        {
            var coords = projection ([d.long, d.lat])
            return coords[0];
        })

        .attr("y" , function(d)
        {
            var coords = projection ([d.long, d.lat])
            return coords[1];
        })
        .text (function(d)
        {
            return d.name
        })

        .attr("dx", 5)
        .attr("dy", 2)


    }
    
})();