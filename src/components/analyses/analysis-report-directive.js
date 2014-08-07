angular.module('openeis-ui.analyses.analysis-report-directive', [])
.directive('analysisReport', function () {
    return {
        restrict: 'E',
        terminal: true,
        scope: {
            arReport: '=',
        },
        link: function (scope, element, attrs) {
            if (scope.arReport.description) {
                element.append('<p>' + scope.arReport.description + '</p>');
            }

            angular.forEach(scope.arReport.elements, function (reportElement) {
                if (reportElement.title) {
                    element.append('<h1>' + reportElement.title + '</h1>');
                }

                switch (reportElement.type) {
                case 'Table':
                    var table = angular.element('<table><thead><tr/></thead><tbody/></table>');
                    angular.forEach(reportElement.column_info, function (column) {
                        table.find('tr').append('<th>' + column[1] + '</th>');
                    });
                    // TODO: add data rows
                    element.append(table);
                    break;
                case 'TextBlurb':
                    element.append('<p class="text-blurb">' + reportElement.text + '</p>');
                    break;
                case 'LinePlot':
                    element.append(angular.element('<div class="line-plot" />').append(linePlotSVG(getXYDataSet(), reportElement.x_label, reportElement.y_label)));
                    break;
                case 'BarChart':
                    element.append(angular.element('<div class="bar-chart" />').append(barChartSVG(getXYDataSetForBarChart(), reportElement.x_label, reportElement.y_label)));
                    break;
                case 'ScatterPlot':
                    element.append(angular.element('<div class="scatter-plot" />').append(scatterPlotSVG(getXYDataSet(), reportElement.x_label, reportElement.y_label)));
                    break;
                case 'HeatMap':
                    element.append(angular.element('<div class="heat-map" />').append(heatMapSVG(getXYZDataSet(), reportElement.x_label, reportElement.y_label)));
                    break;
                }
            });
        },
    };

    // Used to generate fake data for development
    function getXYDataSet() {
        var i, data = [];

        for (i = 0; i < 100; i++) {
            data.push({
                x: i,
                y: i % (100 / i)
            });
        }

        return data;
    }
    
    // Used to generate fake data for development
    function getXYDataSetForBarChart() {
        var i, data = [];

        for (i = 0; i < 12; i++) {
        	data.push({
                x: i,
                y: i % (12 / i)
            });
        }

        return data;
    }
    
    function getXYZDataSet() {
        var i, j, data = [];

        for (i = 1; i <= 24; i++) {
        	for (j = 1; j <= 7; j++) {
	            data.push({
	                x: i,
	                y: j,
	                value: Math.floor(Math.random() * 24) 
	            });
        	}
            
        }

        return data;
    }

    function linePlotSVG(data, xLabel, yLabel) {
        // Adapted from http://bl.ocks.org/mbostock/3883245

        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 920 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        var x = d3.scale.linear().range([0, width]);

        var y = d3.scale.linear().range([height, 0]);

        var xAxis = d3.svg.axis().scale(x).orient('bottom');

        var yAxis = d3.svg.axis().scale(y).orient('left');

        var line = d3.svg.line()
            .x(function(d) { return x(d.x); })
            .y(function(d) { return y(d.y); })
            .interpolate('basis');

        var svg = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        var graph = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        x.domain(d3.extent(data, function(d) { return d.x; }));
        y.domain(d3.extent(data, function(d) { return d.y; }));

        graph.append('g')
            .attr('class', 'line-plot__axis line-plot__axis--x')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        graph.append('g')
            .attr('class', 'line-plot__axis line-plot__axis--y')
            .call(yAxis)
            .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 6)
                .attr('dy', '.71em')
                .style('text-anchor', 'end')
                .text(yLabel);

        graph.append('path')
            .datum(data)
            .attr('class', 'line-plot__line')
            .attr('d', line);

        return svg[0];
    }

    function barChartSVG(data, xLabel, yLabel) {
        // Adapte from http://bl.ocks.org/mbostock/3885304
    
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
        	width = 920 - margin.left - margin.right,
        	height = 300 - margin.top - margin.bottom;

		var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
		
		var y = d3.scale.linear().range([height, 0]);
		
		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");
		
		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");
		
		var svg = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);
    	    
		var graph = svg.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
				
		x.domain(data.map(function(d) { return d.x; }));
        y.domain([0, d3.max(data, function(d) { return d.y; })]);
				
		  graph.append("g")
		      .attr("class", "bar-chart__axis bar-chart__axis--x")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis);
		
		  graph.append("g")
		      .attr("class", "bar-chart__axis bar-chart__axis--y")
		      .call(yAxis)
		    .append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text("Power");
		
		  graph.selectAll("bar-chart__bar")
		      .data(data)
		    .enter().append("rect")
		      .attr("class", "bar-chart__bar")
		      .attr("x", function(d) { return x(d.x); })
		      .attr("width", x.rangeBand())
		      .attr("y", function(d) { return y(d.y); })
		      .attr("height", function(d) { return height - y(d.y); });
		  
		  
		  return svg[0];
    }

    function scatterPlotSVG(data, xLabel, yLabel) {
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 920 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

        /*
         * value accessor - returns the value to encode for a given data object.
         * scale - maps value to a visual display encoding, such as a pixel position.
         * map function - maps from data value to display value
         * axis - sets up axis
         */

        // setup x
        var xValue = function(d) { return d.x;}, // data -> value
            xScale = d3.scale.linear().range([0, width]), // value -> display
            xMap = function(d) { return xScale(xValue(d));}, // data -> display
            xAxis = d3.svg.axis().scale(xScale).orient("bottom");

        // setup y
        var yValue = function(d) { return d.y;}, // data -> value
            yScale = d3.scale.linear().range([height, 0]), // value -> display
            yMap = function(d) { return yScale(yValue(d));}, // data -> display
            yAxis = d3.svg.axis().scale(yScale).orient("left");

        // setup fill color
        var cValue = function(d) { return 0;},
            color = d3.scale.category10();

        // add the graph canvas to the body of the webpage
        var svg = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom);


        var graph = svg.append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        //replace svg with graph

        // add the tooltip area to the webpage
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


          // don't want dots overlapping axis, so add in buffer to data domain
          xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
          yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

          // x-axis
          graph.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis)
            .append("text")
              .attr("class", "label")
              .attr("x", width)
              .attr("y", -6)
              .style("text-anchor", "end")
              .text(xLabel);

          // y-axis
          graph.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("class", "label")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text(yLabel);

          // draw dots
          graph.selectAll(".dot")
              .data(data)
            .enter().append("circle")
              .attr("class", "dot")
              .attr("r", 3.5)
              .attr("cx", xMap)
              .attr("cy", yMap)
              .style("fill", function(d) { return color(cValue(d));})
//              .on("mouseover", function(d) {
//                 tooltip.transition()
//                       .duration(200)
//                       .style("opacity", .9);
//                  tooltip.html("data point" + "<br/> (" + xValue(d)
//                    + ", " + yValue(d) + ")")
//                       .style("left", (d3.event.pageX + 5) + "px")
//                       .style("top", (d3.event.pageY - 28) + "px");
//              })
//              .on("mouseout", function(d) {
//                  tooltip.transition()
//                       .duration(500)
//                       .style("opacity", 0);
//              });

/*
          // draw legend
          var legend = graph.selectAll(".legend")
              .data(color.domain())
            .enter().append("g")
              .attr("class", "legend")
              .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

          // draw legend colored rectangles
          legend.append("rect")
              .attr("x", width - 18)
              .attr("width", 18)
              .attr("height", 18)
              .style("fill", color);

          // draw legend text
          legend.append("text")
              .attr("x", width - 24)
              .attr("y", 9)
              .attr("dy", ".35em")
              .style("text-anchor", "end")
              .text(function(d) { return d;})
*/
            return svg[0];
    }

    function heatMapSVG(data, xLabel, yLabel) {
    	// Adapted from http://bl.ocks.org/tjdecke/5558084
    	var margin = { top: 50, right: 0, bottom: 100, left: 30 },
        	width = 960 - margin.left - margin.right,
        	height = 430 - margin.top - margin.bottom,
        	gridSize = Math.floor(width / 24),
        	legendElementWidth = gridSize*2,
        	buckets = 9,
        	colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
        	y_array = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        	x_array = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];


    	var colorScale = d3.scale.quantile()
            .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
            .range(colors);

        var svg = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        var graph = svg.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        
        
        var yLabels = graph.selectAll(".yLabel")
            .data(y_array)
            .enter().append("text")
              .text(function (d) { return d; })
              .attr("x", 0)
              .attr("y", function (d, i) { return i * gridSize; })
              .style("text-anchor", "end")
              .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
              .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "yLabel mono axis axis-workweek" : "yLabel mono axis"); });

        var xLabels = graph.selectAll(".xLabel")
            .data(x_array)
            .enter().append("text")
              .text(function(d) { return d; })
              .attr("x", function(d, i) { return i * gridSize; })
              .attr("y", 0)
              .style("text-anchor", "middle")
              .attr("transform", "translate(" + gridSize / 2 + ", -6)")
              .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "xLabel mono axis axis-worktime" : "xLabel mono axis"); });

        var heatMap = graph.selectAll(".value")
            .data(data)
            .enter().append("rect")
            .attr("x", function(d) { return (d.x - 1) * gridSize; })
            .attr("y", function(d) { return (d.y - 1) * gridSize; })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "value bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", colors[0]);

        heatMap.transition().duration(1000)
            .style("fill", function(d) { return colorScale(d.value); });

        heatMap.append("title").text(function(d) { return d.value; });
            
        var legend = graph.selectAll(".legend")
            .data([0].concat(colorScale.quantiles()), function(d) { return d; })
            .enter().append("g")
            .attr("class", "legend");

        legend.append("rect")
          .attr("x", function(d, i) { return legendElementWidth * i; })
          .attr("y", height)
          .attr("width", legendElementWidth)
          .attr("height", gridSize / 2)
          .style("fill", function(d, i) { return colors[i]; });

        legend.append("text")
          .attr("class", "mono")
          .text(function(d) { return "≥ " + Math.round(d); })
          .attr("x", function(d, i) { return legendElementWidth * i; })
          .attr("y", height + gridSize);
    
        return svg[0];
    	
    }
});
