(function () 
{
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
    var showLines = true; 
    var selectedEntity = null; 

    // var initialCenter = [47.1625, 19.5033];  // Set your desired initial center coordinates

    // All the files I need to call
    d3.queue()
        .defer(d3.json, "world.topojson")
        .defer(d3.csv, "geo_no_camps.csv")
        .defer(d3.json, "birth_count.json")
        .defer(d3.csv, "SS_Camps_Definitive.csv")
        .defer(d3.json, "camp_count_new.json")
        .defer(d3.json, "clean_data2.json") 
        .await(ready);

        // Defines what kind of world map we use    
        var projection = d3.geoMercator()
        .translate([width / 2, height / 2])
        .scale(500)
        //.center(initialCenter);

    var path = d3.geoPath()
        .projection(projection);

    var simulation = d3.forceSimulation()
        .force("collide", d3.forceCollide().radius(function (d) 
        {
            return Math.sqrt(d.entityCount) * 0.5 + 2;
        }));

    // Defines our functions
    function ready(error, data, entities, entityCounts, newEntities, campCounts, testimonyData) 
    {

        var countries = topojson.feature(data, data.objects.countries).features;

        // Creates the countries on the map
        svg.selectAll(".country")
            .data(countries)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", path);

        // Organizes the data in entities
        var groupedEntities = d3.nest()
            .key(function (d) 
            {
                return d.properties_Place_name;
            })
            .entries(entities);

        // Adds entity count to each city    
        groupedEntities.forEach(function (city) 
        {
            var count = entityCounts[city.key] || 0;
            city.entityCount = count;
        });

        // Creates Circles for each city in groupedEntities
        var bubbles = svg.selectAll(".city-bubble")
    .data(groupedEntities)
    .enter().append("g")
    .attr("class", "city-bubble-group")
    .on('mouseover', function (d) 
    {
        d3.select(this).classed("selected", true);
        var [x, y] = d3.mouse(this);
        tooltip.transition()
            .duration(200)
            
            .style("opacity", .9);

        tooltip.html(d.key + "<br/>Residents: " + d.entityCount)
            
    })
    .on('mouseout', function (d) 
    {
        d3.select(this).classed("selected", false);
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    })
    .on('click', function (d) 
    {
        if (selectedEntity === d) 
        {
            selectedEntity = null;
        } else 
        {
            selectedEntity = d;
        }
        updateLines();
        showResidentsList(d);
    });
        // Append circle to each group
        bubbles.append("circle")
            .attr("r", function (d) {
                return Math.sqrt(d.entityCount) * 0.5;
            })
            .attr("class", "city-bubble")
            .attr("fill-opacity", 0.7)
            .attr("cx", function (d) 
            {
                return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[0];
            })
            .attr("cy", function (d) 
            {
                return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[1];
            });

                // This piece creates images inside the bubbles

                //bubbles.append("image")
                //.attr("xlink:href", "City_logo.png") // Adjust the path to your image
                //.attr("x", function (d) {
                //   return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[0] - Math.sqrt(d.entityCount) * 0.5;
                //})
                //.attr("y", function (d) {
                //  return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[1] - Math.sqrt(d.entityCount) * 0.5;
                //})
                //.attr("width", function (d) {
                //  return Math.sqrt(d.entityCount);
                //})
                //.attr("height", function (d) {
                //  return Math.sqrt(d.entityCount);
                //});

        // Groups Entities for the Subcamps    
        var groupedNewEntities = d3.nest()
            .key(function (d) 
            {
                return d.MAIN;
            })
            .entries(newEntities);

        // Counts the entities and counts up the total for each camp         
        groupedNewEntities.forEach(function (city) 
        {
            var count = campCounts[city.key] || 0;
            city.campCount = count;
        });

        // Creates Circles for each city in groupedNewEntities
        var newBubbles = svg.selectAll(".new-city-bubble")
            .data(groupedNewEntities)
            .enter().append("circle")
            .attr("r", function (d) 
            {
                return d.campCount * 0.05;
            })
            .attr("class", "new-city-bubble")
            .style("fill-opacity", 0.6)
            .style("fill", "#AA4639")
            .on('mouseover', function (d) 
            {
                d3.select(this).classed("selected", true);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

                tooltip.html(d.key + "<br/>Camp Count: " + d.campCount)
                    
            })
            .on('mouseout', function (d) 
            {
                d3.select(this).classed("selected", false);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on('click', function (d) 
            {
                if (selectedEntity === d) 
                {
                    selectedEntity = null;
                } else {
                    selectedEntity = d;
                }
                updateLines();
                showResidentsList(d);
            });

        // Associate testimony data with bubbles
        associateDataWithBubbles(testimonyData, groupedEntities, groupedNewEntities);

        simulation.nodes(groupedEntities.concat(groupedNewEntities))
            .on("tick", function () 
            {
                bubbles.attr("cx", function (d) 
                {
                    return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[0];
                })
                    .attr("cy", function (d) 
                    {
                        return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[1];
                    });

                newBubbles.attr("cx", function (d) 
                { // Change "x" to "cx"
                    return projection([d.values[0].LONG, d.values[0].LAT])[0];
                })
                    .attr("cy", function (d) 
                    { // Change "y" to "cy"
                        return projection([d.values[0].LONG, d.values[0].LAT])[1];
                    });

                updateLines();
            });
            // shows the places name and the resident count
        var tooltip = d3.select("#map").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
            

        var residentsList = d3.select("#residents-list")
            .append("ul")
            .attr("class", "list-group")
            

            var textContentDiv = d3.select("#residents-list")
            .append("div")
            .attr("id", "text-content")
            
        //Is the resident list that stores the Names and testimony ID for each enitity
        function showResidentsList(city) {
            
            residentsList.selectAll("li").remove();
        
            var testimonyItems = residentsList
                .append("li")
                .attr("class", "list-group-item")
                .style("font-size", "25px")
                .text(city.key + " ")
                .selectAll("li.testimony-id-item")
                .data(city.testimonyIDs || [])
                .enter().append("li")
                .attr("class", "list-group-item testimony-id-item")
                .text(function (d) 
                { 
                    return d.name + ", Testimony ID: " + d.id; 
                })
                .on('mouseover', function () 
                {
                    d3.select(this).style("font-weight", "bold");
                })
                .on('mouseout', function () 
                {
                    if (!d3.select(this).classed("selected")) 
                    {
                        d3.select(this).style("font-weight", "normal");
                    }
                })
                .on('click', function (testimonyID) 
                {
                    var isSelected = d3.select(this).classed("selected");
        
                    residentsList.selectAll(".testimony-id-item").style("font-weight", "normal").classed("selected", false);
        
                    if (!isSelected) 
                    {
                        d3.select(this).classed("selected", true).style("font-weight", "bold");
                        displayTextContent(testimonyID);
                    }
                });
        }
        //List that shows the testimonies, when clicking on a item in the resident list
        function displayTextContent(testimonyID) 
        {
            var textFilePath = 'text-en_clean/' + testimonyID.id + '.txt';
        
            d3.text(textFilePath, function (error, textContent) {
                if (error) 
                {
                    console.error('Error loading text content:', error);
                    return;
                }
        
                // Update the content of the text-content-container
                d3.select("#text-content-container")
                    .html('<h2>Testimony</h2>' +
                        '<div id="text-content-list">' +
                        '<strong>Name:</strong> ' + testimonyID.name + '<br>' +
                        '<strong>ID:</strong> ' + testimonyID.id + '<br>' +
                        '<strong>Testimony:</strong><br>' + textContent +
                        '</div>');
            });
        }
        //Buttons to toggle the different enitity groups (Cities, Camps etc.)
        d3.select("#toggleButton")
            .on("click", function () 
            {
                showBubbles = !showBubbles;
                bubbles.style("display", showBubbles ? "initial" : "none");

            });

        d3.select("#togglecampsButton")
            .on("click", function () 
            {
                showBubbles = !showBubbles;

                newBubbles.style("display", showBubbles ? "initial" : "none");
            });

        d3.select("#toggleLinesButton")
            .on("click", function () 
            {
                showLines = !showLines;
                svg.selectAll(".connection-line").style("display", showLines ? "initial" : "none");
            });

            function updateLines() 
            {
                svg.selectAll(".connection-line").remove();
        
                if (selectedEntity && showLines) 
                {
                    var coordinates = getBubbleCoordinates(selectedEntity);
                    drawLines(coordinates);
                }
            }

            function getBubbleCoordinates(bubble) 
            {
                var coordinates = [];
            
                bubble.testimonyIDs.forEach(function (testimony) 
                {
                    var entity = groupedEntities.find(function (e) 
                    {
                        return e.testimonyIDs && e.testimonyIDs.some(item => item.id === testimony.id);
                    });
            
                    var newEntity = groupedNewEntities.find(function (ne) 
                    {
                        return ne.testimonyIDs && ne.testimonyIDs.some(item => item.id === testimony.id);
                    });
            
                    if (entity && newEntity) 
                    {
                        coordinates.push(projection([entity.values[0].geometry_coordinates_long, entity.values[0].geometry_coordinates_lat]));
                        coordinates.push(projection([newEntity.values[0].LONG, newEntity.values[0].LAT]));
                    }
                });
            
                return coordinates;
            }
            //Draws the lines between the entities based on if the ID is availble in each entity
        function drawLines(coordinates) 
        {
            var line = d3.line()
                .x(function (d) { return d[0]; })
                .y(function (d) { return d[1]; })
                .curve(d3.curveCatmullRomClosed);
        
            svg.append("path")
                .datum(coordinates)
                .attr("class", "connection-line")
                .attr("d", line)
                .style("stroke", "#4c4542")
                .style("stroke-width", 0.3)
                .style("fill", "none")
                .style("stroke-dasharray", "none")
                .attr("transform", d3.zoomTransform(svg.node())); // Apply the current zoom transformation
        }
    }
    
    

    // Zooms in on the map
    var zoom = d3.zoom()
    .scaleExtent([1, 30])
    .on("zoom", zoomed);

    svg.call(zoom);

    // Apply the initial center without zoom
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2 - projection(initialCenter)[0], height / 2 - projection(initialCenter)[1]));

    function zoomed() 
    {
    svg.selectAll("path, circle, rect, text, .connection-line, connection-line, path, image")
        .attr("transform", d3.event.transform);

    updateLines();
    }


    // this function iterates through each record in the testimonyData 
    // and associates the testimony ID with the corresponding city or new city bubble.
    function associateDataWithBubbles(testimonyData, groupedEntities, groupedNewEntities) {
        testimonyData.data.forEach(function (record) {

            var placeOfBirth = record[3];
            var testimonyID = record[1];
            var name = record[0]; // Assuming the "Name" column is at index 0
            var camps = record[8];
            
    
            var entityBubble = groupedEntities.find(function (city) {
            return city.key === placeOfBirth;
        });
    
            if (entityBubble) 
            {
                if (!entityBubble.testimonyIDs) 
                {
                    entityBubble.testimonyIDs = [];
                }
                entityBubble.testimonyIDs.push({ name: name, id: testimonyID });
            }
    
            var newEntityBubble = groupedNewEntities.find(function (city) {
                return city.key === camps;
            });
    
            if (newEntityBubble) 
            {
                if (!newEntityBubble.testimonyIDs) 
                {
                    newEntityBubble.testimonyIDs = [];
                }
                newEntityBubble.testimonyIDs.push({ name: name, id: testimonyID });
            }
        });
    }

    
})();