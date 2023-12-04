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

    //Handles which datasets to use to depict info on the screen

    d3.queue()
    .defer(d3.json, "world.topojson")
    .defer(d3.csv, "worldcities.csv")
    .await(ready)

    //Handles which projection format the map should be in.

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

        //Handles visual creation of the map via the json file.

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


        //Handles the CSV data for the countries and shows it as circles on the map

        svg.selectAll(".city-circle")
        .data(capitals)
        .enter().append("circle")
        .attr("r" , 2)
        .attr("cx" , function(d)
        {
            var coords = projection ([d.lng, d.lat])
            return coords[0];
        })

        .attr("cy" , function(d)
        {
            var coords = projection ([d.lng, d.lat])
            return coords[1];
        })

        //Handles the CSV data for the country names and shows it as text on the map

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

    //Adds zoom functionality to map
    const zoomElement = document.querySelector(".map");
    let zoom = 1;

    document.addEventListener("wheel", function (e)
    {
        if (e.deltaY > 0)
        {
            zoomElement.computedStyleMap.transform = `scale(${(zoom += 0.1)})`;
        }
        else
        {
            zoomElement.computedStyleMap.transform = `scale(${(zoom -= 0.1)})`;
        }
    });
    
})();