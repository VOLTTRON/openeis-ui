angular.module('openeis-ui.data-reports.app-report-directive', [])
.directive('appReport', function () {
    return {
        restrict: 'E',
        terminal: true,
        scope: {
            reportObject: '=',
        },
        link: function (scope, element, attrs) {
            // Fake report object for now
            scope.reportObject = {
                reportElements: [
                    {
                        type: 'TextBlurb',
                        title: 'Text Title',
                        text: 'This is a text blurb.',
                    },
                    {
                        type: 'LinePlot',
                        title: 'Line plot',
                        x_label: 'Time',
                        y_label: 'Temperature',
                    },
                    {
                        type: 'BarChart',
                        title: 'Bar chart',
                        x_label: 'Time',
                        y_label: 'Temperature',
                    },
                    {
                        type: 'ScatterPlot',
                        title: 'Scatter plot',
                        x_label: 'Time',
                        y_label: 'Temperature',
                    },
                    {
                        type: 'HeatMap',
                        title: 'Heat map',
                        x_label: 'Time',
                        y_label: 'Temperature',
                    },
                    {
                        type: 'Table',
                        title: 'Data Table',
                        x_label: 'Time',
                        y_label: 'Temperature',
                    },
                ],
            };

            angular.forEach(scope.reportObject.reportElements, function (reportElement) {
                if (reportElement.title) {
                    element.append('<h1>' + reportElement.title + '</h1>');
                }

                switch (reportElement.type) {
                case 'TextBlurb':
                    element.append('<p class="text-blurb">' + reportElement.text + '</p>');
                    break;
                case 'LinePlot':
                    element.append(angular.element('<div class="line-plot" />').append(linePlotSVG(getXYDataSet(), reportElement.x_label, reportElement.y_label)));
                    break;
                case 'BarChart':
                    element.append(angular.element('<div class="bar-chart" />').append(barChartSVG(getXYDataSet(), reportElement.x_label, reportElement.y_label)));
                    break;
                case 'ScatterPlot':
                    element.append(angular.element('<div class="scatter-plot" />').append(scatterPlotSVG(getXYDataSet(), reportElement.x_label, reportElement.y_label)));
                    break;
                case 'HeatMap':
                    // element.append(angular.element('<div class="heat-map" />').append(heatMapSVG(getXYZDataSet(), reportElement.x_label, reportElement.y_label)));
                    break;
                case 'Table':
                    element.append(angular.element('<div class="data-table" />').append(simpleTableSVG(getTableDataSet(), reportElement.x_label, reportElement.y_label)));
                    break
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
                y: i % (100 / i),
            });
        }

        return data;
    }

    // Used to generate fake data for development
    function getTableDataSet() {
        var i, data = [];

        for (i = 0; i < 100; i++) {
            data.push({
                x: i,
                y: i % (100 / i),
            });
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
        // TODO: create (with D3.js) and return SVG
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
        // TODO: create (with D3.js) and return SVG
    }

    function simpleTableSVG(data, xLabel, yLabel) {
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 920 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
        var formatdate = d3.time.format("%b %d %Y");
        var rows = [[1,2,formatdate(new Date(Date.parse("2013-08-10T00:00:00")))]]


//        var row
//        row.mu = 1.0
//        row.sigma = 2.2
//        row.dt = formatdate(new Date(Date.parse("2013-08-10T00:00:00")))



          var svg = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom);

         var table = svg.append('table').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

//          var table = d3.select("#datatable").append("table");
              thead = table.append("thead");
              tbody = table.append("tbody");

          thead.append("th").text("Date");
          thead.append("th").text("Opponent");
          thead.append("th").text("Result");
          thead.append("th").text("Rating");
          thead.append("th").text("");

/*
          var tr = tbody.selectAll("tr")
              .data(rows)
              .enter().append("tr");

          var td = tr.selectAll("td")
                .data(function(d) { return [d.dt, d.opp, d.result, d.mu]; })
              .enter().append("td")
                .text(function(d) { return d; });

          var width = 80,
              height = d3.select("table")[0][0].clientHeight,
              mx = 10,
              radius = 2;
*/


        return svg[0]
    }

});
