(function() {
    var margin = { top:100, left:100, right:100, bottom:100},
    height = 1000 - margin.top - margin.bottom,
    width = 2000 - margin.left - margin.right;

    var svg = d3.select("#map")
    .append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Handles which datasets to use to depict info on the screen

    d3.queue()
    .defer(d3.json, "world.topojson")
    .defer(d3.csv, "capitalCities.csv")
    .await(ready)

    //Handles which projection format the map should be in.

    var projection = d3.geoMercator()
    .translate ([ width / 2, height / 1])
    .scale(500)


    var path = d3.geoPath()
    .projection(projection)

    function ready (error, data, capitals) 
    {
        console.log(data)

        var countries = topojson.feature(data, data.objects.countries).features

        console.log(countries)

        //Handles visual creation of the map via the json file.

        svg.selectAll(".country")
        .data(countries)
        .enter() .append("path")
        .attr("class" , "country")
        .attr("d" , path)
        


       


        //Handles the CSV data for the countries and shows it as circles on the map

        svg.selectAll(".city-circle")
        .data(capitals)
        .enter().append("circle")
        .attr("r" , 4)
        .attr("class" , "city-circle")
        .attr("cx" , function(d)
        {
            var coords = projection ([d.capital_lng, d.capital_lat])
            return coords[0];
        })

        .attr("cy" , function(d)
        {
            var coords = projection ([d.capital_lng, d.capital_lat])
            return coords[1];
        })

        .on('mouseover' , function(d) 
        {
            d3.select(this).classed("selected" , true)
        })

        .on('mouseout' , function(d) 
        {
            d3.select(this).classed("selected" , false)
        })

     // test for more formats at ones

        svg.selectAll(".city-circle")
        .data(capitals)
        .enter().append("circle")
        .attr("r" , 4)
        .attr("class" , "city-circle")
        .attr("cx" , function(d)
        {
            var coords = projection ([d.lang, d.lat])
            return coords[0];
        })

        .attr("cy" , function(d)
        {
            var coords = projection ([d.lang, d.lat])
            return coords[1];
        })

        //Handles the CSV data for the country names and shows it as text on the map

        svg.selectAll(".city-label")
        .data(capitals)
        .enter().append("text")
        .attr("class" , "city-label")
        .attr("x" , function(d)
        {
            var coords = projection ([d.capital_lng, d.capital_lat])
            return coords[0];
        })

        .attr("y" , function(d)
        {
            var coords = projection ([d.capital_lng, d.capital_lat])
            return coords[1];
        })
        .text (function(d)
        {
            return d.name
        })

        .attr("dx", 5)
        .attr("dy", 2)


    }

    var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

  svg.call(zoom);

  function zoomed() {
    svg.selectAll("path,circle")
      .attr("transform", d3.event.transform);
    };

    

})();