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
        // TODO: create (with D3.js) and return SVG
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
