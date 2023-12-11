(function() {
    var margin = { top: 100, left: 100, right: 100, bottom: 100 },
        height = 1000 - margin.top - margin.bottom,
        width = 2000 - margin.left - margin.right;

    // Defines the layout of the map
    var svg = d3.select("#map")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var showBubbles = true; // Variable to track bubble visibility, used for the toggle

    // Handles which datasets to use to depict info on the screen
    d3.queue()
        .defer(d3.json, "world.topojson") // Used to showcase the map
        .defer(d3.csv, "geo_no_camps.csv") // Geo ref for the cities
        .defer(d3.json, "birth_count.json") // Shows how many live in each city
        .defer(d3.csv, "SS_Camps_Definitive.csv") // Geo ref for the camps
        .defer(d3.json, "camp_count.json")
        .await(ready);

    // Handles which projection format the map should be in.
    var projection = d3.geoMercator()
        .translate([width / 2, height / 1])
        .scale(500);

    var path = d3.geoPath()
        .projection(projection);

    var simulation = d3.forceSimulation()
        .force("collide", d3.forceCollide().radius(function(d) 
        {
            return Math.sqrt(d.entityCount) * 0.5 + 2; // Add a small buffer
        }));

    function ready(error, data, entities, entityCounts, newEntities, campCounts) {
        console.log(data);

        var countries = topojson.feature(data, data.objects.countries).features;

        console.log(countries);

        // Handles visual creation of the map via the JSON file.
        svg.selectAll(".country")
            .data(countries)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", path);

        // Group entities by city name
        var groupedEntities = d3.nest()
            .key(function(d) { 
                return d.properties_Place_name; 
            })
            .entries(entities);

        // Add entity counts to the groupedEntities
        groupedEntities.forEach(function(city) {
            var count = entityCounts[city.key] || 0;
            city.entityCount = count;
        });

        // Handles the CSV data for the cities and shows them as a bubble map
        var bubbles = svg.selectAll(".city-bubble")
            .data(groupedEntities)
            .enter().append("circle")
            .attr("r", function(d) {
                return Math.sqrt(d.entityCount) * 0.5;
            })
            .attr("class", "city-bubble")
            .attr("fill-opacity", 0.6)
            .on('mouseover', function(d) {
                d3.select(this).classed("selected", true);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.key + "<br/>Residents: " + d.entityCount)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on('mouseout', function(d) {
                d3.select(this).classed("selected", false);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on('click', function(d) {
                showResidentsList(d);
            });

        // Group new entities by city name
        var groupedNewEntities = d3.nest()
            .key(function(d) { 
                return d.SUBCAMP; 
            })
            .entries(newEntities);

        // Add camp counts to the groupedNewEntities
        groupedNewEntities.forEach(function(city) {
            var count = campCounts[city.key] || 0;
            city.campCount = count;
        });

        // Handles the new CSV data for the Concentration camps and shows them as additional rectangles
        var newBubbles = svg.selectAll(".new-city-bubble")
    .data(groupedNewEntities)
    .enter().append("rect")
    .attr("width", function(d) {
        // Adjust the width based on the camp count
        return d.campCount * 0.1; // Adjust the scaling factor based on your preference
    })
    .attr("height", function(d) {
        // Adjust the height based on the camp count
        return d.campCount * 0.1; // Adjust the scaling factor based on your preference
    })
    .attr("class", "new-city-bubble")
    .style("fill-opacity", 0.6)
    .style("fill", "#69b3a2")
    .on('mouseover', function(d) {
        d3.select(this).classed("selected", true);
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(d.key + "<br/>Camp Count: " + d.campCount)
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    })
    .on('mouseout', function(d) {
        d3.select(this).classed("selected", false);
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    })
    .on('click', function(d) {
        showResidentsList(d);
    });

simulation.nodes(groupedEntities.concat(groupedNewEntities))
    .on("tick", function() {
        bubbles.attr("cx", function(d) {
                return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[0];
            })
            .attr("cy", function(d) {
                return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[1];
            });

        newBubbles.attr("x", function(d) {
                // Adjust the x position to center the rectangle
                return projection([d.values[0].LONG, d.values[0].LAT])[0] - (d.campCount * 0.05);
            })
            .attr("y", function(d) {
                // Adjust the y position to center the rectangle
                return projection([d.values[0].LONG, d.values[0].LAT])[1] - (d.campCount * 0.05);
            });
    });

        var tooltip = d3.select("#map").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var residentsList = d3.select("#residents-list")
            .append("ul")
            .attr("class", "list-group");

        function showResidentsList(city) {
            console.log("Clicked on city:", city);
            residentsList.selectAll("li").remove();
            residentsList.append("li")
                .attr("class", "list-group-item")
                .text(city.key);
        }

        d3.select("#toggleButton")
            .on("click", function() {
                showBubbles = !showBubbles;
                bubbles.style("display", showBubbles ? "initial" : "none");
                newBubbles.style("display", showBubbles ? "initial" : "none");
            });
    }

    var zoom = d3.zoom()
        .scaleExtent([1, 30])
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed() {
        svg.selectAll("path, circle, rect, text")
            .attr("transform", d3.event.transform);
    }
})();
