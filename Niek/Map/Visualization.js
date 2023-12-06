(function() {
    var margin = { top: 100, left: 100, right: 100, bottom: 100 },
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
        .defer(d3.csv, "geo_no_camps.csv")
        .await(ready)

    //Handles which projection format the map should be in.
    var projection = d3.geoMercator()
        .translate([width / 2, height / 1])
        .scale(500);

    var path = d3.geoPath()
        .projection(projection);

    function ready(error, data, entities) {
        console.log(data)

        var countries = topojson.feature(data, data.objects.countries).features

        console.log(countries)

        //Handles visual creation of the map via the json file.
        svg.selectAll(".country")
            .data(countries)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", path);

        // Group entities by city name
        var groupedEntities = d3.nest()
            .key(function(d) { return d.properties_Place_name; })
            .entries(entities);

        //Handles the CSV data for the cities and shows them as bubble map
        var bubbles = svg.selectAll(".city-bubble")
            .data(groupedEntities)
            .enter().append("circle")
            .attr("r", function(d) {
                // Adjust the radius based on the number of entities in each city
                return Math.sqrt(d.values.length) * 1;
            })
            .attr("class", "city-bubble")
            .attr("cx", function(d) {
                var coords = projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat]);
                return coords[0];
            })
            .attr("cy", function(d) {
                var coords = projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat]);
                return coords[1];
            })
            .attr("fill-opacity", 0.6) // Set the fill-opacity to 0.6 for semi-transparency
            .on('mouseover', function(d) {
                d3.select(this).classed("selected", true);

                // Show city name when hovering over the circle
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.key)
                    .style("left", (d3.event.pageX + 10) + "px") // Adjust left position
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on('mouseout', function(d) {
                d3.select(this).classed("selected", false);

                // Hide tooltip when moving out of the circle
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Tooltip for displaying city names
        var tooltip = d3.select("#map").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }


    //Handles zoom function
    var zoom = d3.zoom()
        .scaleExtent([1, 30])
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed() {
        svg.selectAll("path, circle, text")
            .attr("transform", d3.event.transform);
    }

})();