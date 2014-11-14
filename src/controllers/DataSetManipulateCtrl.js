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

angular.module('openeis-ui')
.controller('DataSetManipulateCtrl', function ($location, $scope, DataSetFilters, DataSets, Modals, project, dataSet) {
    $scope.Modals = Modals;
    $scope.project = project;
    $scope.dataSet = dataSet;
    $scope.availableFilters = DataSetFilters.query();
    $scope.filters = {};

    $scope.$on('$locationChangeStart', function (event) {
        if ($scope.filterAdded() && !confirm('Abandon data set manipulation?')) {
            event.preventDefault();
        }
    });

    $scope.filterAdded = function () {
        var hasFilter = false;

        angular.forEach($scope.filters, function (topicFilters) {
            if (topicFilters.length) {
                hasFilter = true;
            }
        });

        return hasFilter;
    };

    $scope.addFilterTo = function (topic) {
        $scope.filters[topic] = $scope.filters[topic] || [];
        $scope.newFilter = { topic: topic };
        Modals.openModal('newFilter');
    };

    $scope.saveNewFilter = function () {
        var parameters = {};

        angular.forEach($scope.newFilter.filter.parameters, function (value, key) {
            parameters[key] = $scope.newFilter.parameters[key];
        });

        $scope.filters[$scope.newFilter.topic].push([
            $scope.newFilter.topic,
            $scope.newFilter.filter.id,
            parameters,
        ]);
        Modals.closeModal('newFilter');
    };

    $scope.raiseFilter = function (filter) {
        var topicFilters = $scope.filters[filter[0]],
            index = topicFilters.indexOf(filter);

        if (index === 0) { return; }

        topicFilters.splice(index, 1);
        topicFilters.splice(index - 1, 0, filter);
    };

    $scope.lowerFilter = function (filter) {
        var topicFilters = $scope.filters[filter[0]],
            index = topicFilters.indexOf(filter);

        if (index === topicFilters.length - 1) { return; }

        topicFilters.splice(index, 1);
        topicFilters.splice(index + 1, 0, filter);
    };

    $scope.deleteFilter = function (filter) {
        var topicFilters = $scope.filters[filter[0]];
        topicFilters.splice(topicFilters.indexOf(filter), 1);
    };

    $scope.apply = function () {
        var filters = [];

        $scope.applying = true;

        angular.forEach($scope.filters, function (topicFilters) {
            filters = filters.concat(topicFilters);
        });

        DataSets.manipulate(dataSet, filters).then(function () {
            // Clear filters so we don't trigger confirmation
            $scope.filters = {};
            $location.url('projects/' + project.id);
        }, function (rejection) {
            var errors = rejection.data;

            if (angular.isArray(errors)) {
                alert(errors.join('\n'));
            } else {
                alert(errors);
            }
        }).finally(function () {
            delete $scope.applying;
        });
    };
});
