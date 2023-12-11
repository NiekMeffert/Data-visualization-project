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

    var showBubbles = true; // Variable to track bubble visibility

    // Handles which datasets to use to depict info on the screen
    d3.queue()
        .defer(d3.json, "world.topojson")
        .defer(d3.csv, "geo_no_camps.csv")
        .defer(d3.json, "birth_count.json") // Add JSON file with entity counts
        .defer(d3.csv, "SS_Camps_Definitive.csv") // Add the new CSV file
        .await(ready);

    // Handles which projection format the map should be in.
    var projection = d3.geoMercator()
        .translate([width / 2, height / 1])
        .scale(500);

    var path = d3.geoPath()
        .projection(projection);

    var simulation = d3.forceSimulation()
        .force("collide", d3.forceCollide().radius(function(d) {
            return Math.sqrt(d.entityCount) * 0.5 + 2; // Add a small buffer
        }));

    function ready(error, data, entities, entityCounts, newEntities) {
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
            .key(function(d) { return d.properties_Place_name; })
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
                // Adjust the radius based on the entity count in each city
                return Math.sqrt(d.entityCount) * 0.5;
            })
            .attr("class", "city-bubble")
            .attr("fill-opacity", 0.6) // Set the fill-opacity to 0.6 for semi-transparency
            .on('mouseover', function(d) {
                d3.select(this).classed("selected", true);

                // Show city name and entity count when hovering over the circle
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.key + "<br/>Residents: " + d.entityCount)
                    .style("left", (d3.event.pageX + 10) + "px") // Adjust left position
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on('mouseout', function(d) {
                d3.select(this).classed("selected", false);

                // Hide tooltip when moving out of the circle
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on('click', function(d) {
                // Show residents list on click
                showResidentsList(d);
            });

        // Group new entities by city name
        var groupedNewEntities = d3.nest()
            .key(function(d) { return d.SUBCAMP; }) // Assuming SUBCAMP is the key for the new entities
            .entries(newEntities);

        // Add new entity counts to the groupedNewEntities
        groupedNewEntities.forEach(function(city) {
            var count = d3.sum(city.values, function(d) { return +d.PEAK_POP; }) || 0;
            city.entityCount = count;
        });

        // Handles the new CSV data for the Concentration camps and shows them as additional rectangles
        var newBubbles = svg.selectAll(".new-city-bubble")
            .data(groupedNewEntities)
            .enter().append("rect")
            .attr("width", function(d) {
                // Adjust the width based on the entity count in each city
                return Math.sqrt(d.entityCount) * 0.02 * 2; // Multiply by 2 to get a proportional width
            })
            .attr("height", function(d) {
                // Adjust the height based on the entity count in each city
                return Math.sqrt(d.entityCount) * 0.02 * 2; // Multiply by 2 to get a proportional height
            })
            .attr("class", "new-city-bubble")
            .style("fill-opacity", 0.6) // Set the fill-opacity to 0.6 for semi-transparency
            .style("fill", "#69b3a2") // Set a different color for new entities
            .on('mouseover', function(d) {
                d3.select(this).classed("selected", true);

                // Show city name and entity count when hovering over the rectangle
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.key + "<br/>Residents: " + d.entityCount)
                    .style("left", (d3.event.pageX + 10) + "px") // Adjust left position
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on('mouseout', function(d) {
                d3.select(this).classed("selected", false);

                // Hide tooltip when moving out of the rectangle
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on('click', function(d) {
                // Show residents list on click
                showResidentsList(d);
            });

        // Is meant to cluster the bubbles together when zoomed out
        simulation.nodes(groupedEntities.concat(groupedNewEntities))
        .on("tick", function() {
            bubbles.attr("cx", function(d) {
                    return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[0];
                })
                .attr("cy", function(d) {
                    return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[1];
                });
    
            newBubbles.attr("x", function(d) {
                    return projection([d.values[0].LONG, d.values[0].LAT])[0] - (Math.sqrt(d.entityCount) * 0.02);
                })
                .attr("y", function(d) {
                    return projection([d.values[0].LONG, d.values[0].LAT])[1] - (Math.sqrt(d.entityCount) * 0.02);
                })
                .attr("width", function(d) {
                    return Math.sqrt(d.entityCount) * 0.02 * 2;
                })
                .attr("height", function(d) {
                    return Math.sqrt(d.entityCount) * 0.02 * 2;
                });
        });
        // Tooltip for displaying city names and entity counts
        var tooltip = d3.select("#map").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Create an empty list for the residents
        var residentsList = d3.select("#residents-list")
            .append("ul")
            .attr("class", "list-group");

        // Function to show residents list
        function showResidentsList(city) {
            console.log("Clicked on city:", city);

            // Clear the existing list content
            residentsList.selectAll("li").remove();

            // Display the city name in the residents list
            residentsList.append("li")
                .attr("class", "list-group-item")
                .text(city.key + " - Residents: " + city.entityCount);
        }

        // Button to toggle bubble visibility
        d3.select("#toggleButton")
            .on("click", function() {
                showBubbles = !showBubbles;
                bubbles.style("display", showBubbles ? "initial" : "none");
                newBubbles.style("display", showBubbles ? "initial" : "none");
            });
    }

    // Handles zoom function
    var zoom = d3.zoom()
        .scaleExtent([1, 30])
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed() {
        svg.selectAll("path, circle, rect, text")
            .attr("transform", d3.event.transform);
    }
})();
