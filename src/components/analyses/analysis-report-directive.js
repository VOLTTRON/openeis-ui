angular.module('openeis-ui.analyses.analysis-report-directive', [])
.directive('analysisReport', function () {
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
        // TODO: create (with D3.js) and return SVG
    }

    function heatMapSVG(data, xLabel, yLabel) {
        // TODO: create (with D3.js) and return SVG
    }
});
