describe('openeis-ui.analyses.analysis-report-directive', function () {
    var $compile, scope, element;

    beforeEach(function () {
        module('openeis-ui.analyses.analysis-report-directive');

        inject(function($rootScope, _$compile_) {
            $compile = _$compile_;
            scope = $rootScope.$new();
        });

        scope.report = {};
        scope.data = {};

        element = angular.element('<analysis-report ar-report="report" ar-data="data"></analysis-report>');
        $compile(element)(scope);
    });

    it('should show report description', function () {
        scope.report.description = 'Report description';
        $compile(element)(scope);
        expect(element.html()).toBe('<p>Report description</p>');
    });

    it('should render element titles', function () {
        scope.report.elements = [{}, { title: 'Element2 title' }, {}];
        $compile(element)(scope);
        expect(element.html()).toBe('<h1>Element2 title</h1>');
    });

    it('should render table elements', function () {
        scope.report.elements = [{
            type: 'Table',
            column_info: [
                ['col1', 'Column 1'],
                ['col2', 'Column 2'],
            ],
            table_name: 'data_table1',
            description: 'Table description',
            title: 'Table title'
        }];

        scope.data = {
            data_table1: [
                { col1: 'r1c1', col2: 'r1c2' },
                { col1: 'r2c1', col2: 'r2c2' },
                { col1: 'r3c1', col2: 'r3c2' },
            ]
        };

        $compile(element)(scope);

        expect(element.find('table').length).toBe(1);
        expect(element.find('th').length).toBe(2);
        expect(element.find('th').eq(0).text()).toBe('Column 1');
        expect(element.find('th').eq(1).text()).toBe('Column 2');
        expect(element.find('tbody').find('tr').length).toBe(3);
        expect(element.find('tbody').find('tr').eq(0).find('td').length).toBe(2);
        expect(element.find('tbody').find('tr').eq(0).find('td').eq(0).text()).toBe('r1c1');
    });

    it('should render text blurbs', function () {
        scope.report.elements = [{ type: 'TextBlurb', text: 'Blurb text.'}];
        $compile(element)(scope);
        expect(element.html()).toBe('<p class="text-blurb">Blurb text.</p>');
    });

    it('should render line plots', function () {
        scope.report.elements = [{
            type: 'LinePlot',
            xy_dataset_list: [
                { table_name: 'data_table1', x_column: 'col1', y_column: 'col2' },
                { table_name: 'data_table2', x_column: 'col1', y_column: 'col2' },
            ],
        }];

        scope.data = { data_table1: [{ col1: 'r1c1', col2: 'r1c2' }] };

        $compile(element)(scope);

        expect(element.children().length).toBe(2);
        expect(element.children().hasClass('line-plot')).toBe(true);
    });

    it('should render bar charts', function () {
        scope.report.elements = [{
            type: 'BarChart',
            xy_dataset_list: [
                { table_name: 'data_table1', x_column: 'col1', y_column: 'col2' },
                { table_name: 'data_table2', x_column: 'col1', y_column: 'col2' },
            ],
        }];

        scope.data = { data_table1: [{ col1: 'r1c1', col2: 'r1c2' }] };

        $compile(element)(scope);

        expect(element.children().length).toBe(2);
        expect(element.children().hasClass('bar-chart')).toBe(true);
    });

    it('should render scatter plots', function () {
        scope.report.elements = [{
            type: 'ScatterPlot',
            xy_dataset_list: [
                { table_name: 'data_table1', x_column: 'col1', y_column: 'col2' },
                { table_name: 'data_table2', x_column: 'col1', y_column: 'col2' },
            ],
        }];

        scope.data = { data_table1: [{ col1: 'r1c1', col2: 'r1c2' }] };

        $compile(element)(scope);

        expect(element.children().length).toBe(2);
        expect(element.children().hasClass('scatter-plot')).toBe(true);
    });

    it('should render heat maps', function () {
        scope.report.elements = [{
            type: 'HeatMap',
            table_name: 'data_table1',
            x_column: 'col1',
            y_column: 'col2',
            z_column: 'col3',
        }];

        scope.data = { data_table1: [{ col1: 'r1c1', col2: 'r1c2', col3: 'r1c3' }] };

        $compile(element)(scope);

        expect(element.children().length).toBe(1);
        expect(element.children().hasClass('heat-map')).toBe(true);
    });
});
