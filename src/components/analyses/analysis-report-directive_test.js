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

    it('should render datetime scatter plots', function () {
        scope.report.elements = [{
            type: 'DatetimeScatterPlot',
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
