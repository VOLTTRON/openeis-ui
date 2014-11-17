// Copyright (c) 2014, Battelle Memorial Institute
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those
// of the authors and should not be interpreted as representing official policies,
// either expressed or implied, of the FreeBSD Project.
//
//
// This material was prepared as an account of work sponsored by an
// agency of the United States Government.  Neither the United States
// Government nor the United States Department of Energy, nor Battelle,
// nor any of their employees, nor any jurisdiction or organization
// that has cooperated in the development of these materials, makes
// any warranty, express or implied, or assumes any legal liability
// or responsibility for the accuracy, completeness, or usefulness or
// any information, apparatus, product, software, or process disclosed,
// or represents that its use would not infringe privately owned rights.
//
// Reference herein to any specific commercial product, process, or
// service by trade name, trademark, manufacturer, or otherwise does
// not necessarily constitute or imply its endorsement, recommendation,
// or favoring by the United States Government or any agency thereof,
// or Battelle Memorial Institute. The views and opinions of authors
// expressed herein do not necessarily state or reflect those of the
// United States Government or any agency thereof.
//
// PACIFIC NORTHWEST NATIONAL LABORATORY
// operated by BATTELLE for the UNITED STATES DEPARTMENT OF ENERGY
// under Contract DE-AC05-76RL01830

angular.module('openeis-ui.directives.analysis-report', [])
.directive('analysisReport', function () {
    return {
        restrict: 'E',
        terminal: true,
        scope: {
            arReport: '=',
            arData: '=',
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
                    var table = angular.element('<table><thead><tr/></thead><tbody/></table>'),
                        tbody = table.find('tbody');

                    angular.forEach(reportElement.column_info, function (column) {
                        table.find('tr').append('<th>' + column[1] + '</th>');
                    });

                    angular.forEach(scope.arData[reportElement.table_name], function (row) {
                        var tr = angular.element('<tr/>');

                        angular.forEach(reportElement.column_info, function (column) {
                            tr.append('<td>' + row[column[0]] + '</td>');
                        });

                        tbody.append(tr);
                    });

                    element.append(table);
                    break;

                case 'TextBlurb':
                    element.append('<p class="text-blurb">' + reportElement.text + '</p>');
                    break;

                case 'LinePlot':
                    // TODO: plot all datasets on a single lineplot
                    angular.forEach(reportElement.xy_dataset_list, function (dataset) {
                        var data = [];
                        angular.forEach(scope.arData[dataset.table_name], function (row) {
                            data.push({ x: row[dataset.x_column], y: row[dataset.y_column] });
                        });
                        element.append(angular.element('<div class="line-plot" />').append(linePlotSVG(data, reportElement.x_label, reportElement.y_label)));
                    });
                    break;

                case 'BarChart':
                    angular.forEach(reportElement.xy_dataset_list, function (dataset) {
                        var data = [];
                        angular.forEach(scope.arData[dataset.table_name], function (row) {
                            data.push({ x: row[dataset.x_column], y: row[dataset.y_column] });
                        });
                        element.append(angular.element('<div class="bar-chart" />').append(barChartSVG(data, reportElement.x_label, reportElement.y_label)));
                    });
                    break;

                case 'ScatterPlot':
                    // TODO: plot all datasets on a single scatterplot
                    angular.forEach(reportElement.xy_dataset_list, function (dataset) {
                        var data = [];
                        angular.forEach(scope.arData[dataset.table_name], function (row) {
                            data.push({ x: row[dataset.x_column], y: row[dataset.y_column] });
                        });
                        element.append(angular.element('<div class="scatter-plot" />').append(scatterPlotSVG(data, reportElement.x_label, reportElement.y_label)));
                    });
                    break;

                case 'DatetimeScatterPlot':
                    // TODO: plot all datasets on a single scatterplot
                    angular.forEach(reportElement.xy_dataset_list, function (dataset) {
                        var data = [];
                        angular.forEach(scope.arData[dataset.table_name], function (row) {
                            data.push({ x: row[dataset.x_column], y: row[dataset.y_column] });
                        });
                        element.append(angular.element('<div class="scatter-plot scatter-plot--datetime" />').append(datetimeScatterPlotSVG(data, reportElement.x_label, reportElement.y_label)));
                    });
                    break;

                case 'HeatMap':
                    var data = [];
                    angular.forEach(scope.arData[reportElement.table_name], function (row) {
                        data.push({ x: row[reportElement.x_column], y: row[reportElement.y_column], z: row[reportElement.z_column] });
                    });
                    element.append(angular.element('<div class="heat-map" />').append(heatMapSVG(data, reportElement.x_label, reportElement.y_label)));
                    break;

                case 'RetroCommissioningOAED':
                    element.append(angular.element('<div class="retro-commissioning-oaed" />').append(retroCommissioningOAEDSVG(scope.arData[reportElement.table_name])));
                    break;

                case 'RetroCommissioningAFDD':
                    element.append(angular.element('<div class="retro-commissioning-afdd" />').append(retroCommissioningAFDDSVG(scope.arData[reportElement.table_name])));
                    break;
                }
            });
        }
    };

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
        // Adapted from http://bl.ocks.org/mbostock/3885304

        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 920 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);

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
            .call(xAxis)
            .text(xLabel);

        graph.append("g")
            .attr("class", "bar-chart__axis bar-chart__axis--y")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(yLabel);

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
            .append("svg:title")
            .text(function (d) { return xLabel + ': ' + d.x + '\n' + yLabel + ': ' + d.y; });

        return svg[0];
    }

    function datetimeScatterPlotSVG(data, xLabel, yLabel) {
        var margin = {top: 20, right: 20, bottom: 180, left: 40},
            width = 920 - margin.left - margin.right,
            height = 450 - margin.top - margin.bottom;

        /*
         * value accessor - returns the value to encode for a given data object.
         * scale - maps value to a visual display encoding, such as a pixel position.
         * map function - maps from data value to display value
         * axis - sets up axis
         */

        // setup x
        var xValue = function(d) { return Date.parse(d.x);}, // data -> value
            xScale = d3.time.scale().range([0, width]), // value -> display
            xMap = function(d) { return xScale(xValue(d));}, // data -> display
            xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(30);

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

        var formats = [
                // [format, test function] in order of granularity
                ['%Y-%m', function (d) { return d.getMonth(); }],
                ['%Y-%m-%d', function (d) { return d.getDate(); }],
                ['%Y-%m-%d %H:%M', function (d) { return d.getHours(); }],
                ['%Y-%m-%d %H:%M:%S', function (d) { return d.getSeconds(); }],
            ];

        xAxis.tickFormat(d3.time.format('%Y')); // default format
        xScale.ticks.apply(xScale, xAxis.ticks()).forEach(function (tick) {
            while (formats.length && formats[0][1](tick)) {
                // test returned true, update tickFormat
                xAxis.tickFormat(d3.time.format(formats[0][0]));
                // remove format from list
                formats.shift();
            }
        });

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

        graph.selectAll(".x.axis > .tick > text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("dx", "-.5em")
            .attr("dy", "-.5em");

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
            .append("svg:title")
            .text(function (d) { return xLabel + ': ' + d.x + '\n' + yLabel + ': ' + d.y; });

        return svg[0];
    }

    function heatMapSVG(data, xLabel, yLabel) {
        // Adapted from http://bl.ocks.org/tjdecke/5558084

        var margin = { top: 50, right: 0, bottom: 100, left: 100 },
            width = 960 - margin.left - margin.right,
            gridSize = Math.floor(width / 24),
            dates = d3.set(data.map(function (d) { return d.y; })).values();
            height = (dates.length + 1) * gridSize,
            legendElementWidth = gridSize*2,
            buckets = 9,
            colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]; // alternatively colorbrewer.YlGnBu[9]

        var colorScale = d3.scale.quantile()
            //.domain([buckets, d3.max(data, function (d) { return d.value; })])
            .domain(d3.extent(data, function(d) { return d.z; }))
            .range(colors);

        var svg = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        var graph = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var yLabels = graph.selectAll(".yLabel")
            .data(dates)
            .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
            .attr("class", "yLabel");

        var xLabels = graph.selectAll(".xLabel")
            .data(d3.range(24))
            .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", "xLabel");

        var heatMap = graph.selectAll(".value")
            .data(data)
            .enter().append("rect")
            .attr("x", function(d) { return (d.x ) * gridSize; })
            .attr("y", function(d) { return dates.indexOf(d.y) * gridSize; })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "value bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", colors[0]);

        heatMap.transition().duration(1000)
            .style("fill", function(d) { return colorScale(d.z); });

        heatMap.append("title").text(function(d) { return d.z; });

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

    function formatDate(d) {
        var dd = d.getDate();
        if (dd<10) dd= '0'+dd;
        var mm = d.getMonth() + 1;  // now moths are 1-12
        if (mm<10) mm= '0'+mm;
        var yy = d.getFullYear();

        return yy+'-'+mm+'-'+dd;
    }

    function formatHour(hr) {
        var hh = "";
        if (hr<10) hh = '0'+hr;
        else hh = hr.toString();
        return hh;
    }

    function oaeAggregateData(inData, legends) {
        // resData = {
        //      "date": {
        //                  "hr": {
        //                              "diagnostic_name": {
        //                                                      datetime
        //                                                      diagnostic_name:
        //                                                      diagnostic_message:
        //                                                      energy_impact:
        //                                                      color_code:
        //                              }
        //                              state: //combined state of all diagnostics
        //                  }
        //      }
        // }
        // Aggregate & filter duplicated data
        var resData = {};
        inData.forEach(function(d) {
            var tsParts = d.datetime.split("T");
            var dateParts = tsParts[0];
            var hrParts = tsParts[1].split(":")[0];
            if (dateParts in resData) {
                if (hrParts in resData[dateParts]) {
                    if (d.diagnostic_name in resData[dateParts][hrParts]) {
                        if (d.color_code == legends["RED"].string) {
                            resData[dateParts][hrParts][d.diagnostic_name] = d;
                        } else if (d.color_code == legends["GREEN"].string) {
                            if (resData[dateParts][hrParts][d.diagnostic_name] == legends["GREY"].string) {
                                resData[dateParts][hrParts][d.diagnostic_name] = d;
                            }
                        }
                    }
                    else {
                        resData[dateParts][hrParts][d.diagnostic_name] = d;
                    }
                } else {
                    resData[dateParts][hrParts] = {};
                    resData[dateParts][hrParts][d.diagnostic_name] = d;
                }
            }
            else {
                resData[dateParts] = {};
                resData[dateParts][hrParts] = {};
                resData[dateParts][hrParts][d.diagnostic_name] = d;
            }
        });

        // Set state & energy impact for each available hour
        for (var dt in resData) {
            if (resData.hasOwnProperty(dt)) {
                for (var hr in resData[dt]) {
                    if (resData[dt].hasOwnProperty(hr)) {
                        var state = legends["GREY"].string;
                        var diagnostic = "";
                        var diagnostic_message = legends["GREY"].value;
                        var energy_impact = "NA";
                        for (var dn in resData[dt][hr]) {
                            if (resData[dt][hr].hasOwnProperty(dn)) {
                                if (resData[dt][hr][dn].color_code == legends["RED"].string) {
                                    state = legends["RED"].string;
                                    diagnostic = dn;
                                    diagnostic_message = resData[dt][hr][dn].diagnostic_message;
                                    if (resData[dt][hr][dn].energy_impact != null)
                                        energy_impact = resData[dt][hr][dn].energy_impact;
                                    break;
                                } else if (resData[dt][hr][dn].color_code == legends["GREEN"].string) {
                                    state = legends["GREEN"].string;
                                    diagnostic = dn;
                                    diagnostic_message = legends["GREEN"].value;
                                    energy_impact = "NA";
                                }
                            }
                        } //each_diagnostic
                        resData[dt][hr].state = state;
                        resData[dt][hr].diagnostic = diagnostic;
                        resData[dt][hr].diagnostic_message = diagnostic_message;
                        resData[dt][hr].energy_impact = energy_impact;
                    }
                }//each_hr
            }
        }//each_date

        var arrData = [];
        // Get Date min & max
        var arrDate = [];
        for (var dt in resData) {
            if (resData.hasOwnProperty(dt)) {
                var dateParts = dt.split("-");
                var tempDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 0, 0, 0, 0);
                arrDate.push(tempDate);
            }
        }
        var domain = d3.extent(arrDate);
        var domainMax = domain[1];
        var domainMin = domain[0];
        var noDays = Math.round(Math.abs((domainMax - domainMin)/(24*60*60*1000)));

        // Convert hash to array and keep only necessary values
        // Fill in default result for hours that have no result
        for (var numberOfDaysToAdd = 0; numberOfDaysToAdd <= noDays; numberOfDaysToAdd++) {
            var curDate = new Date(domainMin.getTime());
            curDate.setDate(curDate.getDate() + numberOfDaysToAdd);
            var strCurDate = formatDate(curDate);
            if (resData.hasOwnProperty(strCurDate)) {
                for (var i = 0; i < 24; i++) {
                    var iStr = formatHour(i);
                    if (resData[strCurDate].hasOwnProperty(iStr)) {
                        arrData.push({
                            date: curDate,
                            y: i,
                            state: resData[strCurDate][iStr].state,
                            diagnostic: resData[strCurDate][iStr].diagnostic,
                            diagnostic_message: resData[strCurDate][iStr].diagnostic_message,
                            energy_impact: resData[strCurDate][iStr].energy_impact
                        });
                    } else {
                        arrData.push({
                            date: curDate,
                            y: i,
                            state: legends["GREEN"].string,
                            diagnostic: "",
                            diagnostic_message: legends["GREEN"].value,
                            energy_impact: "NA"
                        });
                    }
                }
            } else {
                for (var j = 0; j < 24; j++) {
                    arrData.push({
                        date: curDate,
                        y: j,
                        state: legends["GREEN"].string,
                        diagnostic: "",
                        diagnostic_message: legends["GREEN"].value,
                        energy_impact: "NA"
                    });
                }
            }
        }
        return arrData;
    }

    function retroCommissioningOAEDSVG(data) {
        // ToDo: When display this SVG in the dialog box, clip-path and other layout measures (e.g. margin & padding) are
        //          messed up. There are some tricks to get this right. However, best not to touch/deal with those things.
        //var container_class = ".retro-commissioning-oaed .plot-area";
        var containerWidth = 1000; //$(container_class).width();
        var containerHeight = 600; //$(container_class).height();
        var legends = {
            "GREY": {
                value: "No Diagnosis",
                color: "#B3B3B3",
                state_value: 0,
                string: "GREY"
            },
            "GREEN": {
                value: "Normal - No Fault",
                color: "#509E7A",
                state_value: 1,
                string: "GREEN"
            },
            "RED": {
                value: "Fault",
                color: "#E22400",
                state_value: 2,
                string: "RED"
            }
        };
        var DEFAULT = {
            value: "Default",
            color: "#509E7A", //GREEN
            state_value: -1,
            string: "DEFAULT"
        };
        var sample_data = oaeAggregateData(data, legends);

        var svg = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
                    .attr("width", containerWidth)
                    .attr("height", containerHeight);
        //Width and height
        var margin = {top: 30, right: 30, bottom: 0, left: 100}; //margin to the axes of the plot
        var padding = {top: 0, right: 0, bottom: 0, left: 0}; //padding from the axes to the actual plot
        var width = containerWidth - margin.left - margin.right;
        var height = containerHeight - margin.top - margin.bottom - padding.top - padding.bottom;
        height = 480; //Due to strict sizing, hard code height

        var format = d3.time.format("%b %d");//d3.time.format("%m/%d/%y");
        var scrollbarStrokeWidth = 10;

        var oneDay = 24*60*60*1000;
        var rectWidth = height/24;
        var rectBorderWidth = 1;
        var maxWidth = width - padding.left - padding.right;
        var clipPathWidth = containerWidth - margin.left - margin.right + 10; //32 * rectWidth;

        var xScale = d3.time.scale();
        var yDomainData = makeArray(1,24);
        var yScale = d3.scale.ordinal()
                .domain(yDomainData)
                .rangeRoundBands([height, 0]);

        //Create axises
        var xAxis = d3.svg.axis()
                //.scale(xScale)
                .orient("bottom")
                .ticks(d3.time.day)
                .tickFormat(format);
        var yAxis = d3.svg.axis()
                //.scale(yScale)
                .orient("left");

        var plot_area = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xAxisEle = plot_area.append("g")
            .attr("id", "xAxisEle_OAE")
            .attr("class", "x axis");
        xAxisEle.attr("clip-path","url(#clip_OAE)")
            .attr("transform", "translate(0," + height + ")");

        var clip_area = plot_area.append("g")
            .attr("clip-path","url(#clip_OAE)");

        var xScrollbarHeightPos = height + 70 ;
        var brush = d3.svg.brush();
        brush.extent([0, 0])
            .on("brush", brushed);
        var handle = null;

        var xScrollbarScale = d3.time.scale()
            .range([padding.left, clipPathWidth]);
//        xScale.nice(d3.time.minute, 1440);
//        xScale.ticks(d3.time.minute, 1440);
//        xScrollbarScale.ticks(d3.time.minute, 1440);
//        xScrollbarScale.nice(d3.time.minute, 1440);

        var xDomainData = d3.extent(sample_data, function(d) { return d.date; });
        var xDomainMax = xDomainData[1];
        var xDomainMin = xDomainData[0];
        var noDays = Math.round(Math.abs((xDomainMax - xDomainMin)/(oneDay)));
        var actualWidth = noDays*rectWidth;
        if (rectWidth > maxWidth) {
            rectWidth = maxWidth;
        }

        xScale.domain([xDomainMin,xDomainMax])
                //.range([padding.left, actualWidth]);
                .range([padding.left, actualWidth]);

        xAxis.scale(xScale);
        yAxis.scale(yScale);

        var yAxisEle = plot_area.append("g")
            .attr("id", "yAxisEle_OAE")
            .attr("class", "y axis");
        yAxisEle.append("text")
                .attr("transform", "rotate(-90)")
                .attr("dx", "-20em")
                .attr("dy", "-3em")
                .style("text-anchor", "start")
                .text("Hour of Day");

        //Tooltip
        var tip = d3.tip()
                .attr('class', 'd3-tip')
                //.offset([-10, 0])
                .html(function(d) {
                    return "Timestamp: <strong>" + d.date + "</strong><br/>" +
                    "Last Run Diagnostic: <strong>" + d.diagnostic + "</strong>" + "</strong><br/>" +
                    "Diagnostic Message: <strong>" + d.diagnostic_message + "</strong>" + "</strong><br/>" +
                    "Energy Impact: <strong>" + d.energy_impact + "</strong>" + "</strong><br/>";
                })
                .direction(function(d) {
                    if (d.y>18) {
                        return "e";
                    }
                    return "n";
                });
        plot_area.call(tip);

        //Clip area
        plot_area.append("clipPath")
                .attr("id", "clip_OAE")
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", clipPathWidth)
                .attr("height", height);

        // Plot diagnostic result
        clip_area.selectAll("rect")
                .data(sample_data)
                .enter()
                .append("rect")
                .attr("x", function (d) {
                    return xScale(d.date);
                })
                .attr("y", function (d) {
                    return yScale(d.y+1); //Convert from 0-based to 1-based hour
                })
                .attr("width", rectWidth)
                .attr("height", rectWidth)
                .attr("fill", function(d) {
                    return legends[d.state].color;
                })
                .attr("opacity", 1)
                .style({"stroke-width": rectBorderWidth, "stroke": "black"})
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

        xScrollbarScale.domain([xDomainMin,xDomainMax]);
        var xScrollbarAxis = d3.svg.axis()
                .scale(xScrollbarScale)
                .tickSize(0)
                .orient("bottom")
                .tickPadding(10);
                //.ticks(d3.time.day)
                //.tickFormat(function(d) { return d; });

        plot_area.append("g")
                .attr("class", "x-scrollbar")
                .attr("transform", "translate(" + padding.left + "," + xScrollbarHeightPos + ")")
                .call(xScrollbarAxis)
                .select(".domain")
                .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("class", "halo");

        //brush.x(xScale);
        brush.x(xScrollbarScale);
        var slider = plot_area.append("g")
                .attr("class", "slider")
                .attr("transform", "translate(" + padding.left + "," + (xScrollbarHeightPos-scrollbarStrokeWidth/2) + ")");
        handle = slider.append("circle")
                .attr("class", "handle")
                //.attr("transform", "translate(" + padding.left + "," + xScrollbarHeightPos + ")")
                .attr("transform", "translate(" + padding.left + "," + scrollbarStrokeWidth/2 + ")")
                .attr("r", 7);
        slider.call(brush);
        slider.selectAll(".extent,.resize")
                .remove();
        slider.select(".background")
                //.attr("width", 600)
                .attr("height", scrollbarStrokeWidth);

        slider.call(brush.event);

        return svg[0];


        function brushed() {
            var value = brush.extent();
            if (value != null) {
                value = value[0];

                if (d3.event.sourceEvent) { // not a programmatic event
                    //value = xScale.invert(d3.mouse(this)[0]);
                    var curPos = d3.mouse(this)[0];

                    if (curPos < padding.left) {
                        curPos = padding.left;

                    }
                    if (curPos > clipPathWidth) {
                        curPos = clipPathWidth;

                    }
                    value = xScrollbarScale.invert(curPos);
                    //brush.extent([0, 0]);
                }
                value.setHours(0,0,0,0);
                if (handle != null) {
                   handle.attr("cx", xScrollbarScale(value));
                }
            }
            zoomed(value);
        }
        function zoomed(value) {
            xAxisEle.call(xAxis);
            xAxisEle.selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-1em")
                    .attr("dy", "0.3em")
                    .attr("transform", function(d) {
                        return "rotate(-90)"
                    });
            yAxisEle.call(yAxis);

            if (d3.event != null) {
                if (d3.event.sourceEvent) {
                    var noDays = ((value.getTime() - xDomainMin) / oneDay); //Convert values to -/+ days and return value
                    clip_area.selectAll("rect").attr("x", function (d) {
                        if (value == null) {
                            return xScale(d.date);
                        }
                        else {
                            //xScale.domain([value,xDomainMax]);
                            //zoom.translate(value,0);
                            var newDate = new Date(d.date.getTime());
                            newDate.setDate(newDate.getDate() - noDays); //Go backwards noDays so the chosen date is in the viewport
                            // The code below is to fix the coordinates issue when showing D3 on dialog box
                            var dialogCoordsFixingRes = xScale(newDate);
                            if (dialogCoordsFixingRes < 0) {
                                dialogCoordsFixingRes = -10000;
                            }
                            return dialogCoordsFixingRes;
                        }
                    });
                    xAxisEle.selectAll("g.tick")
                        .attr("transform", function (d) {
                            var newDate = new Date(d.getTime());
                            newDate.setDate(newDate.getDate() - noDays); //Go backwards noDays so the chosen date is in the viewport
                            // The code below is to fix the coordinates issue when showing D3 on dialog box
                            var dialogCoordsFixingRes = xScale(newDate);
                            if (dialogCoordsFixingRes < 0) {
                                dialogCoordsFixingRes = -10000;
                            }
                            return "translate(" + dialogCoordsFixingRes + ",0)";
                        });
                }
            }
        }
        function makeArray(lowEnd, highEnd) {
            var arr = [];
            while(lowEnd <= highEnd){
                arr.push(lowEnd++);
            }
            return arr;
        }

    }

    function afddAggregateData(inData, legends, diagnosticList) {
        // resData = {
        //      "date": {
        //                      "diagnostic_name": {
        //                                              datetime
        //                                              diagnostic_name:
        //                                              diagnostic_message:
        //                                              energy_impact:
        //                                              color_code:
        //                      }
        //                      state: //combined state of all diagnostics
        //      }
        // }
        // Aggregate & filter duplicated data
        var resData = {};
        inData.forEach(function(d) {
            var tsParts = d.datetime.split("T");
            var dateParts = tsParts[0];
            var diagnostic = d.diagnostic_name;
            var hrParts = tsParts[1].split(":")[0];

            if (dateParts in resData) {
                if (diagnostic in resData[dateParts]) {
                    if (legends[d.color_code].state_value >= legends[resData[dateParts][diagnostic].color_code].state_value) {
                        resData[dateParts][diagnostic] = d;
                    }
                } else {
                    resData[dateParts][diagnostic] = d;
                }
            } else {
                resData[dateParts] = {};
                resData[dateParts][diagnostic] = d;
            }
        });

        var arrData = [];
        // Get Date min & max
        var arrDate = [];
        for (var dt in resData) {
            if (resData.hasOwnProperty(dt)) {
                var dateParts = dt.split("-");
                var tempDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 0, 0, 0, 0);
                arrDate.push(tempDate);
            }
        }
        var domain = d3.extent(arrDate);
        var domainMax = domain[1];
        var domainMin = domain[0];
        var noDays = Math.round(Math.abs((domainMax - domainMin)/(24*60*60*1000)));

        // Convert hash to array and keep only necessary values
        // Fill in default result for hours that have no result
        for (var numberOfDaysToAdd = 0; numberOfDaysToAdd <= noDays; numberOfDaysToAdd++) {
            var curDate = new Date(domainMin.getTime());
            curDate.setDate(curDate.getDate() + numberOfDaysToAdd);
            var strCurDate = formatDate(curDate);
            if (resData.hasOwnProperty(strCurDate)) {
                for (var i = 0; i< diagnosticList.length; i++) {
                    var energy_impact = "NA";
                    if (resData[strCurDate].hasOwnProperty(diagnosticList[i])) {
                        if (resData[strCurDate][diagnosticList[i]].energy_impact != null)
                            energy_impact = resData[strCurDate][diagnosticList[i]].energy_impact;
                        arrData.push({
                            date: curDate,
                            y: i,
                            state: resData[strCurDate][diagnosticList[i]].color_code,
                            diagnostic: resData[strCurDate][diagnosticList[i]].diagnostic_name,
                            diagnostic_message: resData[strCurDate][diagnosticList[i]].diagnostic_message,
                            energy_impact: energy_impact
                        });
                    } else {
                        arrData.push({
                            date: curDate,
                            y: i,
                            state: legends["GREEN"].string,
                            diagnostic: "",
                            diagnostic_message: legends["GREEN"].value,
                            energy_impact: "NA"
                        });
                    }
                }
            } else {
                for (var i = 0; i< diagnosticList.length; i++) {
                arrData.push({
                        date: curDate,
                        y: i,
                        state: legends["GREEN"].string,
                        diagnostic: "",
                        diagnostic_message: legends["GREEN"].value,
                        energy_impact: "NA"
                    });
                }
            }
        }

        return arrData;
    }

    function retroCommissioningAFDDSVG(data) {
        var containerWidth = 1000; //$(container_class).width();
        var containerHeight = 400; //$(container_class).height();
        var margin = {top: 40, right: 0, bottom: 30, left: 350}; //margin of the actual plot
        var padding = {top: 30, right: 30, bottom: 50, left: 30}; //padding of the actual plot
        var width = containerWidth - margin.left - margin.right;
        var height = containerHeight - margin.top - margin.bottom;
        var radius = 8;
        var ref_stroke_clr = "#ccc";
        var format = d3.time.format("%b %d");//d3.time.format("%m/%d/%y");

        var diagnosticList = [
            'Temperature Sensor Dx',
            'Economizer Correctly ON Dx',
            'Economizer Correctly OFF Dx',
            'Excess Outdoor-air Intake Dx',
            'Insufficient Outdoor-air Intake Dx'];
        var yAxisLabels = [
            'ECON1 - ' + diagnosticList[0],
            'ECON2 - ' + diagnosticList[1],
            'ECON3 - ' + diagnosticList[2],
            'ECON4 - ' + diagnosticList[3],
            'ECON5 - ' + diagnosticList[4]];
        var legends = {
            "GREY": {
                value: "No Diagnosis",
                color: "#B3B3B3",
                state: 0,
                string: "GREY"
            },
            "GREEN": {
                value: "Normal",
                color: "#509E7A",
                state: 1,
                string: "GREEN"
            },
            "RED": {
                value: "Fault",
                color: "#E22400",
                state: 2,
                string: "RED"
            }
        };
        var yCategories = yAxisLabels;
        var y2Categories = diagnosticList;
        var svg = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
            .attr("width", containerWidth)
            .attr("height", containerHeight);

        var sample_data = afddAggregateData(data, legends, diagnosticList);
        var xDomain = d3.extent(sample_data, function(d) { return d.date; });
        var items_per_dayCol = yAxisLabels.length;
        var items_per_viewport = 10;
        var inline_padding = Math.floor((width-padding.left-padding.right)/items_per_viewport);
        var plot_width = inline_padding * (sample_data.length/items_per_dayCol);

        var xScale = d3.time.scale()
                .domain(xDomain)
                .range([padding.left, padding.left + plot_width]); //~70
        var yScale = d3.scale.ordinal()
                .domain(yCategories)
                //.rangeRoundBands([0, height], .1);
                .rangePoints([height - padding.top, padding.bottom ]);
//        var yScale2 = d3.scale.ordinal()
//                .domain(y2Categories)
//                .rangePoints([height - padding.top, padding.bottom ]);
        //Create axises
        var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .ticks(d3.time.day)
                .tickFormat(format);

        var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left");
//        var yAxis2 = d3.svg.axis()
//                .scale(yScale2)
//                .orient("right");

        var zoom = d3.behavior.zoom()
                .scaleExtent([1, 1])
                .on("zoom", zoomed);
        zoom.x(xScale);

        var plot_area = svg
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var maxDate = d3.max(sample_data, function(d) { return d.date; });
        plot_area.append("rect")
                .attr("class", "pane")
                .attr("width", width)
                .attr("height", height)
                .call(zoom);


        //Tooltip
        var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return "Timestamp: <strong>" + d.date + "</strong><br/>" +
                        "Diagnostic Message: <strong>" + d.diagnostic_message + "</strong>" + "</strong><br/>" +
                        "Energy Impact: <strong>" + d.energy_impact + "</strong>" + "</strong><br/>";
                });
        plot_area.call(tip);

        //Legends
        var legend_svg = svg.append("g")
                .attr("transform", "translate(" + containerWidth/3 + "," + margin.top/3 + ")");
        var legend_width = 324;
        var legend_height = 34;
        var lpadding = 15;
        legend_svg.append("rect")
                .attr("width", legend_width)
                .attr("height", legend_height)
                .attr("x",0)
                .attr("y",0)
                .attr("rx",5)
                .attr("ry",5)
                .style("stroke","#909090")
                .style("stroke-width",1)
                .style("fill","none");

        var lx = lpadding;
        var arrLegends = [];
        for (var k in legends) {
            if (legends.hasOwnProperty(k)) {
                arrLegends.push(legends[k]);
            }
        }

        var litem = legend_svg.selectAll("g")
                .data(arrLegends)
                .enter()
                .append("g")
                .attr("transform", function(d,i) {
                    if (i>0) {
                        var circle_width = radius * 2;
                        var text_width = getTextWidth(arrLegends[i-1].value, "17pt sans-serif");
                        lx += circle_width + text_width;
                    }
                    return "translate("+ lx + "," + legend_height/2 + ")";
                });
        litem.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", radius)
                .attr("fill", function(d) {
                    return d.color;
                })
                .attr("opacity", 1)
                .on('mouseover', null)
                .on('mouseout', null);
        litem.append("text")
                .attr("x", radius*2+1)
                .attr("y", 0)
                .attr("dy", ".35em")
                .text(function(d) { return d.value; })
                .style("font-size","1em")
                .style("font-family","sans-serif");

        //Draw axises
        var xAxisEle = plot_area.append("g")
            .attr("id", "xAxisEle_AFDD")
            .attr("class", "x axis");
        xAxisEle.attr("clip-path","url(#clip_AFDD)")
            .attr("transform", "translate(0," + (height-5) + ")");

        plot_area.append("g")
            .attr("class", "y axis");
            //.attr("transform", "translate(" + 150 + ",0)");
//        plot_area.append("g")
//                .attr("class", "y2 axis")
//                .attr("transform", "translate(" + width + ",0)");

        //Draw y-grid lines for referencing
        plot_area.selectAll("line.y")
                .data(yCategories)
                .enter().append("line")
                .attr("class", "yAxis")
                .attr("x1", 0)
                //.attr("x2", width)
                .attr("x2", plot_width)
                .attr("y1", yScale)
                .attr("y2", yScale)
                .style("stroke", ref_stroke_clr);


        //Clip area
        plot_area.append("clipPath")
                .attr("id", "clip_AFDD")
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", height);

        var radians = 2 * Math.PI, points = 20;
        var angle = d3.scale.linear()
                .domain([0, points-1])
                .range([0, radians]);

        var line = d3.svg.line.radial()
                .interpolate("basis")
                .tension(0)
                .radius(radius)
                .angle(function(d, i) { return angle(i); });

        var clip_area = plot_area.append("g")
                .attr("clip-path","url(#clip_AFDD)");
        clip_area.selectAll("circle")
                .data(sample_data)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return xScale(d.date);
                })
                .attr("cy", function (d) {
                    return yScale(yCategories[d.y]);
                })
                .attr("r", radius)
                .attr("fill", function(d) {
                    return legends[d.state].color;
                })
                .attr("opacity", 1)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);
        zoomed();

        return svg[0];

        function zoomed() {
            plot_area.select("g.x.axis").call(xAxis);
            plot_area.select("g.y.axis").call(yAxis);
            //plot_area.select("g.y2.axis").call(yAxis2);

            clip_area.selectAll("circle").attr("cx", function(d) {
                var value = xScale(d.date);
                if (value < 0) value = -10000;
                //if (value > width) value = 10000;
                return value;
            });
        }

        function getTextWidth(text, font) {
            // re-use canvas object for better performance
            var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
            var context = canvas.getContext("2d");
            context.font = font;
            var metrics = context.measureText(text);
            return metrics.width;
        };
    }
});
