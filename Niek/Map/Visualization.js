(function () {
    // Defines the map's size
    var margin = { top: 100, left: 100, right: 100, bottom: 100 },
        height = 1000 - margin.top - margin.bottom,
        width = 2000 - margin.left - margin.right;

    // Here we transform the map    
    var svg = d3.select("#map")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Variable that helps with toggling icons    
    var showBubbles = true;

    // All the files I need to call
    d3.queue()
        .defer(d3.json, "world.topojson")
        .defer(d3.csv, "geo_no_camps.csv")
        .defer(d3.json, "birth_count.json")
        .defer(d3.csv, "SS_Camps_Definitive.csv")
        .defer(d3.json, "camp_count_new.json")
        .defer(d3.json, "clean_data2.json") // Replace with the actual file name
        .await(ready);

    // Defines what kind of world map we use    
    var projection = d3.geoMercator()
        .translate([width / 2, height / 1])
        .scale(500);

    var path = d3.geoPath()
        .projection(projection);

    var simulation = d3.forceSimulation()
        .force("collide", d3.forceCollide().radius(function (d) {
            return Math.sqrt(d.entityCount) * 0.5 + 2;
        }));

    // Defines our functions
    function ready(error, data, entities, entityCounts, newEntities, campCounts, testimonyData) {

        var countries = topojson.feature(data, data.objects.countries).features;

        // Creates the countries on the map
        svg.selectAll(".country")
            .data(countries)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", path);

        // Organizes the data in entities
        var groupedEntities = d3.nest()
            .key(function (d) {
                return d.properties_Place_name;
            })
            .entries(entities);

        // Adds entity count to each city    
        groupedEntities.forEach(function (city) {
            var count = entityCounts[city.key] || 0;
            city.entityCount = count;
        });

        // Creates Circles for each city in groupedEntities
        var bubbles = svg.selectAll(".city-bubble")
            .data(groupedEntities)
            .enter().append("circle")
            .attr("r", function (d) {
                return Math.sqrt(d.entityCount) * 0.5;
            })
            .attr("class", "city-bubble")
            .attr("fill-opacity", 0.6)
            .on('mouseover', function (d) {
                d3.select(this).classed("selected", true);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.key + "<br/>Residents: " + d.entityCount)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })

            // Fades the text over the city when not hovering
            .on('mouseout', function (d) {
                d3.select(this).classed("selected", false);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);

                // Shows resident list when clicking on a city        
            })
            .on('click', function (d) {
                showResidentsList(d);
            });

        // Groups Entities for the Subcamps    
        var groupedNewEntities = d3.nest()
            .key(function (d) {
                return d.MAIN;
            })
            .entries(newEntities);

        // Counts the entities and counts up the total for each camp         
        groupedNewEntities.forEach(function (city) {
            var count = campCounts[city.key] || 0;
            city.campCount = count;
        });

        // Creates rectangles for each city in groupedNewEntities
        var newBubbles = svg.selectAll(".new-city-bubble")
            .data(groupedNewEntities)
            .enter().append("rect")
            .attr("width", function (d) {
                return d.campCount * 0.1;
            })
            .attr("height", function (d) {
                return d.campCount * 0.1;
            })
            .attr("class", "new-city-bubble")
            .style("fill-opacity", 0.6)
            .style("fill", "#69b3a2")
            .on('mouseover', function (d) {
                d3.select(this).classed("selected", true);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

                tooltip.html(d.key + "<br/>Camp Count: " + d.campCount)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })

            // Fades text when not hovering
            .on('mouseout', function (d) {
                d3.select(this).classed("selected", false);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })

            .on('click', function (d) {
                showResidentsList(d);
            });

        // Associate testimony data with bubbles
        associateDataWithBubbles(testimonyData, groupedEntities, groupedNewEntities);

        simulation.nodes(groupedEntities.concat(groupedNewEntities))
            .on("tick", function () {
                bubbles.attr("cx", function (d) {
                    return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[0];
                })
                    .attr("cy", function (d) {
                        return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[1];
                    });

                newBubbles.attr("x", function (d) {
                    return projection([d.values[0].LONG, d.values[0].LAT])[0] - (d.campCount * 0.05);
                })
                    .attr("y", function (d) {
                        return projection([d.values[0].LONG, d.values[0].LAT])[1] - (d.campCount * 0.05);
                    });

                // Update the lines connecting bubbles with the same testimony IDs
                updateLines();
            });

        var tooltip = d3.select("#map").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var residentsList = d3.select("#residents-list")
            .append("ul")
            .attr("class", "list-group");

        // In summary, this function updates the residents' list on the webpage to show information about 
        // the clicked city or camp, including the associated testimony IDs.
        function showResidentsList(city) {
            console.log("Clicked on city:", city);
            residentsList.selectAll("li").remove();
            residentsList.append("li")
                .attr("class", "list-group-item")
                .text(city.key + ": Testimony IDs - " + (city.testimonyIDs ? city.testimonyIDs.join(", ") : "None"));
        }

        // Toggles the visuals on the map
        d3.select("#toggleButton")
            .on("click", function () {
                showBubbles = !showBubbles;
                bubbles.style("display", showBubbles ? "initial" : "none");
                newBubbles.style("display", showBubbles ? "initial" : "none");
            });

       // Function to update lines connecting bubbles with the same testimony IDs
function updateLines() {
    // Remove existing lines
    svg.selectAll(".connection-line").remove();

    // Draw lines between bubbles with the same testimony IDs
    groupedEntities.forEach(function (entity) {
        if (entity.testimonyIDs && entity.testimonyIDs.length > 0) {
            var coordinates = getBubbleCoordinates(entity);
            drawLines(coordinates);
        }
    });

    groupedNewEntities.forEach(function (newEntity) {
        if (newEntity.testimonyIDs && newEntity.testimonyIDs.length > 0) {
            var coordinates = getBubbleCoordinates(newEntity);
            drawLines(coordinates);
        }
    });
}

// Function to get the coordinates of a bubble
function getBubbleCoordinates(bubble) {
    var coordinates = [];

    bubble.testimonyIDs.forEach(function (testimonyID) {
        var entity = groupedEntities.find(function (e) {
            return e.testimonyIDs && e.testimonyIDs.includes(testimonyID);
        });

        var newEntity = groupedNewEntities.find(function (ne) {
            return ne.testimonyIDs && ne.testimonyIDs.includes(testimonyID);
        });

        if (entity && newEntity) {
            coordinates.push(projection([entity.values[0].geometry_coordinates_long, entity.values[0].geometry_coordinates_lat]));
            coordinates.push(projection([newEntity.values[0].LONG, newEntity.values[0].LAT]));
        }
    });

    return coordinates;
}

       // Function to get the coordinates of a bubble
function getBubbleCoordinates(bubble) {
    var coordinates = [];

    bubble.testimonyIDs.forEach(function (testimonyID) {
        var entity = groupedEntities.find(function (e) {
            return e.testimonyIDs && e.testimonyIDs.includes(testimonyID);
        });

        var newEntity = groupedNewEntities.find(function (ne) {
            return ne.testimonyIDs && ne.testimonyIDs.includes(testimonyID);
        });

        if (entity && newEntity) {
            coordinates.push(projection([entity.values[0].geometry_coordinates_long, entity.values[0].geometry_coordinates_lat]));
            coordinates.push(projection([newEntity.values[0].LONG, newEntity.values[0].LAT]));
        }
    });

    return coordinates;
}

        // Function to draw lines between coordinates
        function drawLines(coordinates) {
            svg.append("path")
                .datum(coordinates)
                .attr("class", "connection-line")
                .attr("d", d3.line()
                    .x(function (d) { return d[0]; })
                    .y(function (d) { return d[1]; })
                    .curve(d3.curveCatmullRomClosed))
                .style("stroke", "#DAA947")
                .style("stroke-width", 0.2)
                .style("fill", "none")
                .style("stroke-dasharray", "1,1");
        }
    }

    // Zooms in and out of the map
    var zoom = d3.zoom()
        .scaleExtent([1, 30])
        .on("zoom", zoomed);
        

    svg.call(zoom);

    function zoomed() {
        svg.selectAll("path, circle, rect, text, .connection-line, connection-line")
            .attr("transform", d3.event.transform);

            updateLines();
    }

    // In summary, this function iterates through each record in the testimonyData 
    // and associates the testimony ID with the corresponding city or new city bubble.
    function associateDataWithBubbles(testimonyData, groupedEntities, groupedNewEntities) {
        testimonyData.data.forEach(function (record) {
            var placeOfBirth = record[3];
            var testimonyID = record[1];
            var camps = record[8];

            var entityBubble = groupedEntities.find(function (city) {
                return city.key === placeOfBirth;
            });

            if (entityBubble) {
                if (!entityBubble.testimonyIDs) {
                    entityBubble.testimonyIDs = [];
                }
                entityBubble.testimonyIDs.push(testimonyID);
            }

            var newEntityBubble = groupedNewEntities.find(function (city) {
                return city.key === camps;
            });

            if (newEntityBubble) {
                if (!newEntityBubble.testimonyIDs) {
                    newEntityBubble.testimonyIDs = [];
                }
                newEntityBubble.testimonyIDs.push(testimonyID);
            }
        });
    }
})();
