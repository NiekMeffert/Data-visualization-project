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
    var showLines = true;
    var selectedEntity = null;

    // All the files I need to call
    d3.queue()
        .defer(d3.json, "world.topojson")
        .defer(d3.csv, "geo_no_camps.csv")
        .defer(d3.json, "birth_count.json")
        .defer(d3.csv, "Camp_location.csv")
        .defer(d3.json, "camp_count_new.json")
        .defer(d3.json, "clean_data2.json")
        .await(ready);

    // Defines where on the map we are looking when loading in
    var initialCenter = [18.640019, 47.299771];

    // Defines what kind of world map we use    
    var projection = d3.geoMercator()
        .translate([width / 2, height / 2])
        .scale(500)
        .center(initialCenter);

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
            .enter().append("g")
            .attr("class", "city-bubble-group")
            .on('mouseover', function (d) {
                d3.select(this).classed("selected", true);
                var [x, y] = d3.mouse(this);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

                tooltip.html(d.key + "<br/>Residents: " + d.entityCount)

            })
            .on('mouseout', function (d) {
                d3.select(this).classed("selected", false);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on('click', function (d) {
                if (selectedEntity === d) {
                    selectedEntity = null;
                } else {
                    selectedEntity = d;
                }
                updateLines();
                showResidentsList(d);
            });

        // Append circle to each group
        bubbles.append("circle")
            .attr("r", function (d) {
                return Math.sqrt(d.entityCount) * 0.5 + 0.5;
            })
            .attr("class", "city-bubble")
            .attr("fill-opacity", 0.7)
            .attr("cx", function (d) {
                return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[0];
            })
            .attr("cy", function (d) {
                return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[1];
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

        // Creates Circles for each city in groupedNewEntities
        var newBubbles = svg.selectAll(".new-city-bubble")
            .data(groupedNewEntities)
            .enter().append("circle")
            .attr("r", function (d) {
                return d.campCount * 0.05 + 1;
            })
            .attr("class", "new-city-bubble")
            .style("fill-opacity", 0.6)
            .on('mouseover', function (d) {
                d3.select(this).classed("selected", true);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

                tooltip.html(d.key + "<br/>Camp Count: " + d.campCount)

            })
            .on('mouseout', function (d) {
                d3.select(this).classed("selected", false);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on('click', function (d) {
                if (selectedEntity === d) {
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
            .on("tick", function () {
                bubbles.attr("cx", function (d) {
                    return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[0];
                })
                    .attr("cy", function (d) {
                        return projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat])[1];
                    });

                newBubbles.attr("cx", function (d) {
                    return projection([d.values[0].LONG, d.values[0].LAT])[0];
                })
                    .attr("cy", function (d) {
                        return projection([d.values[0].LONG, d.values[0].LAT])[1];
                    });

                updateLines();
            });

        // Shows the places name and the resident count
        var tooltip = d3.select("#map").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var residentsList = d3.select("#residents-list")
            .append("ul")
            .attr("class", "list-group")

        var textContentDiv = d3.select("#residents-list")
            .append("div")
            .attr("id", "text-content")

        var selectedTestimonyID = null;

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
                .html(function (d) {
                    // Display name, testimony ID, and occupation
                    return '<span style="font-weight: bold;">' + d.name + '<br>' + '</span> Testimony ID: ' + d.id + '<br>' + 'Occupation: ' + d.occupation;
                })
                .on('mouseover', function () {
                    d3.select(this).style("font-weight", "bold");
                })
                .on('mouseout', function () {
                    if (!d3.select(this).classed("selected")) {
                        d3.select(this).style("font-weight", "normal");
                    }
                })
                .on('click', function (testimonyID) {
                    var isSelected = d3.select(this).classed("selected");

                    residentsList.selectAll(".testimony-id-item").style("font-weight", "normal").classed("selected", false);

                    if (!isSelected) {
                        d3.select(this).classed("selected", true).style("font-weight", "bold");
                        drawLinesForTestimonyID(testimonyID, city);
                        fetchData(filterTestimonyIDsByEntity(city));
                        displayTextContent(testimonyID);
                    }
                });
        }

        function filterTestimonyIDsByEntity(entity) {
            return entity.testimonyIDs.map(testimony => testimony.id);
        }

        function getCoordinatesForTestimonyID(testimonyID, city, entities, newEntities) {
            var coordinates = [];

            entities.forEach(function (entity) {
                if (entity.testimonyIDs) {
                    var matchingTestimony = entity.testimonyIDs.find(function (item) {
                        return item.id === testimonyID.id;
                    });

                    if (matchingTestimony) {
                        coordinates.push(projection([city.values[0].geometry_coordinates_long, city.values[0].geometry_coordinates_lat]));
                        coordinates.push(projection([entity.values[0].geometry_coordinates_long, entity.values[0].geometry_coordinates_lat]));
                    }
                }
            });

            newEntities.forEach(function (newEntity) {
                if (newEntity.testimonyIDs) {
                    var matchingTestimony = newEntity.testimonyIDs.find(function (item) {
                        return item.id === testimonyID.id;
                    });

                    if (matchingTestimony) {
                        coordinates.push(projection([city.values[0].geometry_coordinates_long, city.values[0].geometry_coordinates_lat]));
                        coordinates.push(projection([newEntity.values[0].LONG, newEntity.values[0].LAT]));
                    }
                }
            });

            return coordinates;
        }

        function displayTextContent(testimonyID) {
            var textFilePath = 'text-en_clean/' + testimonyID.id + '.txt';

            d3.text(textFilePath, function (error, textContent) {
                if (error) {
                    console.error('Error loading text content:', error);
                    return;
                }

                d3.select("#text-content-container")
                    .html('<h2>Testimony</h2>' +
                        '<div id="text-content-list">' +
                        '<strong>Name:</strong> ' + testimonyID.name + '<br>' +
                        '<strong>ID:</strong> ' + testimonyID.id + '<br>' +
                        '<strong>Occupation:</strong> ' + testimonyID.occupation + '<br>' +
                        '<strong>Testimony:</strong><br>' + textContent +
                        '</div>');
            });
        }

        // Buttons to toggle the different entity groups (Cities, Camps etc.)
        d3.select("#toggleButton")
            .on("click", function () {
                showBubbles = !showBubbles;
                bubbles.style("display", showBubbles ? "initial" : "none");

            });

        d3.select("#togglecampsButton")
            .on("click", function () {
                showBubbles = !showBubbles;

                newBubbles.style("display", showBubbles ? "initial" : "none");
            });

        d3.select("#toggleLinesButton")
            .on("click", function () {
                showLines = !showLines;
                svg.selectAll(".connection-line").style("display", showLines ? "initial" : "none");
            });

        function updateLines() {
            svg.selectAll(".connection-line").remove();

            if (showLines && selectedEntity) {
                var coordinates = getBubbleCoordinates(selectedEntity);
                drawLines(coordinates);
            } else if (showLines && selectedTestimonyID) {
                var coordinates = getCoordinatesForTestimonyID(selectedTestimonyID, selectedEntity, groupedEntities, groupedNewEntities);
                drawLines(coordinates);
            }
        }

        function getBubbleCoordinates(bubble) {
            var coordinates = [];

            bubble.testimonyIDs.forEach(function (testimony) {
                var entity = groupedEntities.find(function (e) {
                    return e.testimonyIDs && e.testimonyIDs.some(item => item.id === testimony.id);
                });

                var newEntity = groupedNewEntities.find(function (ne) {
                    return ne.testimonyIDs && ne.testimonyIDs.some(item => item.id === testimony.id);
                });

                if (entity && newEntity) {
                    coordinates.push(projection([entity.values[0].geometry_coordinates_long, entity.values[0].geometry_coordinates_lat]));
                    coordinates.push(projection([newEntity.values[0].LONG, newEntity.values[0].LAT]));
                }
            });

            return coordinates;
        }

        // Draws the lines between the entities based on if the ID is available in each entity
        function drawLines(coordinates) {
            // Remove existing lines
            svg.selectAll(".connection-line").remove();

            // Count the total number of connections
            var connectionCount = coordinates.length / 2;

            // Define a scale for line thickness based on the total number of connections
            var thicknessScale = d3.scaleLinear()
                .domain([1, Math.max(connectionCount, 0.05)]) // Ensure a minimum thickness of 2
                .range([0.05, 0.5]); // Adjust the range as needed

            // Create lines for each pair of coordinates
            for (var i = 0; i < coordinates.length; i += 2) {
                var lineData = [coordinates[i], coordinates[i + 1]];

                // Create a single path for each pair of coordinates
                var line = svg.append("path")
                    .data([lineData])
                    .attr("class", "connection-line")
                    .style("stroke", "#4c4542")
                    .style("stroke-width", thicknessScale(connectionCount))
                    .style("fill", "none")
                    .style("opacity", 0)  // Set initial opacity to 0
                    .attr("transform", d3.zoomTransform(svg.node()));

                // Transition the opacity to 1 and the path to its final shape
                line.transition()
                    .duration(1000)
                    .ease(d3.easeLinear)
                    .style("opacity", 0.8)
                    .attr("d", d3.line()
                        .x(function (d) { return d[0]; })
                        .y(function (d) { return d[1]; })
                    );
            }
        }

        function drawLinesForTestimonyID(testimonyID, city) {
            // Set the selectedTestimonyID when drawing lines for a specific testimony ID
            selectedTestimonyID = testimonyID;
            var coordinates = getCoordinatesForTestimonyID(testimonyID, city, groupedEntities, groupedNewEntities);
            drawLines(coordinates);
        }
    }

    // Zooms in on the map
    var zoom = d3.zoom()
        .scaleExtent([1, 30])
        .on("zoom", zoomed);

    svg.call(zoom);

    // Apply the initial center without zoom
    //svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2 - projection(initialCenter)[0], height / 2 - projection(initialCenter)[1]));

    function zoomed() {
        svg.selectAll("path, circle, rect, text, .connection-line, connection-line, path, image")
            .attr("transform", d3.event.transform);

        updateLines();

        // Make sure to adjust the mouse coordinates for correct interaction
        svg.selectAll(".city-bubble-group")
            .attr("transform", function (d) {
                return "translate(" + projection([d.values[0].geometry_coordinates_long, d.values[0].geometry_coordinates_lat]) + ")";
            });

        svg.selectAll(".new-city-bubble")
            .attr("transform", function (d) {
                return "translate(" + projection([d.values[0].LONG, d.values[0].LAT]) + ")";
            });

        updateLines();
    }

    // This function iterates through each record in the testimonyData 
    // and associates the testimony ID with the corresponding city or new city bubble.
    function associateDataWithBubbles(testimonyData, groupedEntities, groupedNewEntities) {
        testimonyData.data.forEach(function (record) {
            var placeOfBirth = record[3];
            var testimonyID = record[1];
            var occupation = record[6];
            var name = record[0];
            var campsData = record[8];

            // Ensure campsData is an array
            var camps = [];
            if (campsData) {
                if (Array.isArray(campsData)) {
                    camps = campsData;
                } else if (typeof campsData === 'string') {
                    // Split the string into an array, assuming it's comma-separated
                    camps = campsData.split(',').map(function (camp) {
                        return camp.trim();
                    });
                }
            }

            var entityBubble = groupedEntities.find(function (city) {
                return city.key === placeOfBirth;
            });

            if (entityBubble) {
                if (!entityBubble.testimonyIDs) {
                    entityBubble.testimonyIDs = [];
                }

                // Check if the ID is not already associated with this entity
                if (!entityBubble.testimonyIDs.some(item => item.id === testimonyID)) {
                    entityBubble.testimonyIDs.push({ name: name, id: testimonyID, occupation: occupation });
                }
            }

            camps.forEach(function (camp) {
                var newEntityBubble = groupedNewEntities.find(function (city) {
                    return city.key === camp;
                });

                if (newEntityBubble) {
                    if (!newEntityBubble.testimonyIDs) {
                        newEntityBubble.testimonyIDs = [];
                    }

                    // Check if the ID is not already associated with this entity
                    if (!newEntityBubble.testimonyIDs.some(item => item.id === testimonyID)) {
                        newEntityBubble.testimonyIDs.push({ name: name, id: testimonyID });
                    }
                }
            });


        });
    }

    async function fetchData(testimonyIDs) {
        const response = await fetch('word_counts1.json');
        const jsonData = await response.json();

        // Combine word frequencies from all files
        const freqmap = {};
        Object.keys(jsonData.words).forEach(word => {
            const wordData = jsonData.words[word];
            freqmap[word] = wordData.count;
        });

        // Sort the word frequencies in descending order
        const sortedFreq = Object.keys(freqmap).sort((a, b) => freqmap[b] - freqmap[a]);

        // MAKE WORD CLOUD
        // set the dimensions and margins of the graph
        var margin = { top: 5, right: 5, bottom: 5, left: 5 },
            width = 500 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg2 = d3.select("#my_dataviz").append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Constructs a new cloud layout instance
        var layout = d3.layout.cloud()
            .size([width, height])
            .words(sortedFreq.map(function (word) {
                return { text: word, size: freqmap[word] };
            }))
            .padding(5)
            .rotate(function () { return ~~(Math.random() * 2) * 90; })
            .fontSize(function (d) { return 0.3 * d.size + 10; })
            .on("end", draw);

        layout.start();

        // This function takes the output of 'layout' above and draws the words
        function draw(freqmap) {
            // Remove existing words
            d3.select("#Wordcloud").remove();

            // Append the new words
            svg2.append("g")
                .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                .attr("id", "Wordcloud")
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
})();
