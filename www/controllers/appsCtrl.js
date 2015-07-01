'use strict';

angular.module('openstore').controller('appsCtrl', function($scope, $state, $http) {
    $scope.apps = {};
    $scope.app = null;
    $http.get('/repo/repolist.json').then(function(response) {
        $scope.apps = response.data.packages;

        if ($state.params.name) {
            angular.forEach($scope.apps, function(app) {
                if (app.id == $state.params.name) {
                    $scope.app = app;
                }
            });
        }
    });
});
