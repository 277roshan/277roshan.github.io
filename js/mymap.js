// Width and height of SVG
 var width = 960,
     height = 500;

 // Define map projection for Nepal
 var projection = d3.geo.albers()
                    .center([87, 28])
                    .rotate([-85, 0])
                    .parallels([27, 32]);

 // Define path generator
 var path = d3.geo.path()
              .projection(projection);

 //Define quantize scale to sort data values into buckets of color
 var color = d3.scale.quantize()
               .range(["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);

 //Colors taken from colorbrewer.js, included in the D3 download

 // Create SVG element
 var svg = d3.select("body")
             .append("svg")
             .attr("width", width)
             .attr("height", height);

 svg.append("rect")
    .attr("width", width)
    .attr("height", height);

 var g = svg.append("g");

var SELECTED = "Grade1";


 function myFunction() {
    SELECTED = document.getElementById("mySelect").value;
    //console.log("loading" + SELECTED);
    document.getElementById("headtitle").innerHTML = "Dalit Enrollment At " + SELECTED.slice(0, 5) + " " + SELECTED.slice(5)  + " by District ";
    svg.select("g").remove();

    g = svg.append("g");
    loadAllAgain(SELECTED);
 }

loadAllAgain(SELECTED);


function loadAllAgain(SELECTED) {

 //Load in agriculture data
 d3.csv("dalit-enrollment-at-all-levels-by-district-in-all-types-of-school-year-2011-012.csv", function(data) {


      //Set input domain for color scale
   color.domain([
          d3.min(data, function(d) { return 1; }),
          d3.max(data, function(d) { return 2000; })  
   ]);


   // Read topojson data and create the map
   d3.json("nepal-districts.topo.json", function(error, nepal) {
     if(error) return console.error(error);

     var districts = topojson.feature(nepal, nepal.objects.districts);

     projection
       .scale(1)
       .translate([0, 0]);

     var b = path.bounds(districts),
         s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
         t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

     projection
       .scale(s)
       .translate(t);

      //Merge the population data and Topojson
      //Loop through once for each district
      for (var i = 0; i < data.length; i++) {

              //Grab state name
        var dataDistrict = data[i].District
                                  .toLowerCase()
                                  .replace(/^\s+|\s+$/g, "");
        //console.log("Data:" + dataDistrict)

              //Grab data value, and convert from string to float

          console.log("loading all" + SELECTED)
        switch(SELECTED) {
          case "Grade1":
            var dataPopulation = parseFloat(data[i].Grade1);
            break;
          case "Grade2":
            var dataPopulation = parseFloat(data[i].Grade2);
            break;
          case "Grade3":
            var dataPopulation = parseFloat(data[i].Grade3);
            break;
          case "Grade4":
            var dataPopulation = parseFloat(data[i].Grade4);
            break;
          case "Grade5":
            var dataPopulation = parseFloat(data[i].Grade5);
            break;
          case "Grade6":
            var dataPopulation = parseFloat(data[i].Grade6);
            break;
          case "Grade7":
            var dataPopulation = parseFloat(data[i].Grade7);
            break;
          case "Grade8":
            var dataPopulation = parseFloat(data[i].Grade8);
            break;
          case "Grade9":
            var dataPopulation = parseFloat(data[i].Grade9);
            break;
          case "Grade10":
            var dataPopulation = parseFloat(data[i].Grade10);
            break;
          case "Grade11":
            var dataPopulation = parseFloat(data[i].Grade11);
            break;
          case "Grade12":
            var dataPopulation = parseFloat(data[i].Grade12);
            break;
        }

        
        //Console.log("Population:" + dataPopulation)

              //Find the corresponding state inside the GeoJSON
              for (var j = 0; j < districts.features.length; j++) {

                var jsonDistrict = districts.features[j].properties.name
                                            .toLowerCase()
                                            .replace(/^\s+|\s+$/g, "");
                //console.log("Json:" + jsonDistrict)
                //console.log("comparison: " + dataDistrict + " "  + jsonDistrict)

                      if (dataDistrict == jsonDistrict) {


                              //Copy the data value into the JSON for choropleth
                              districts.features[j].properties.value = dataPopulation;
                              //console.log("Output:" +  districts.features[j].properties.value)

                              // Get rest of the values to show
                              // districts.features[j].properties.Area = dataArea;

                              //Stop looking through the JSON
                              break;

                      }
              }
      }

      


     g.selectAll(".districts")
      .data(districts.features)
      .enter()
      .append("path")
      .attr("class", function(d) { return "districts"; })
      .attr("d", path)
      .style("fill", function(d) {
            //Get data value
            var value = d.properties.value;

            if (value) {
                    //If value exists…
                    return color(value);
            } else {
                    //If value is undefined…
                    return "#ddd";
            }
       })
      .on("mouseover", function(d) {
           //Get this bar's x/y values, then augment for the tooltip
           var xPosition = parseFloat(event.pageX+30);
           var yPosition = parseFloat(event.pageY-20);
           //Update the tooltip position and value
           d3.select("#tooltip")
             .style("left", xPosition + "px")
             .style("top", yPosition + "px");
           d3.select("#tooltip #heading")
             .text(d.properties.name.toLowerCase());
           d3.select("#tooltip #population")
             .text("Total student enrollment:   " + (d.properties.value));



           //Show the tooltip
           d3.select("#tooltip").classed("hidden", false);

           d3.select(this.parentNode.appendChild(this))
            //.transition()
            //.duration(100)
             .style({'stroke-width':1,'stroke':'#333','stroke-linejoin':'round',
                     'stroke-linecap': 'round', 'cursor':'pointer'});
       })
       .on("mouseout", function() {
            //Hide the tooltip
            d3.select("#tooltip").classed("hidden", true);

            d3.select(this.parentNode.appendChild(this))
           //.transition()
           //.duration(50)
           .style({'stroke-width':1,'stroke':'#FFFFFF','stroke-linejoin':'round', 'stroke-linecap': 'round' });
       });


      // For cleaner borders
      g.append("path")
       .datum(topojson.mesh(nepal, nepal.objects.districts, function(a, b) { return a !== b;}))
       .attr("class", "district-boundary")
       .attr("d", path);
    });
 });
}
