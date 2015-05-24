'use strict';

angular.module('openappstore').controller('indexCtrl', function($scope, $rootScope, $state, $modal) {
    $scope.$state = $state;

    $rootScope.loginModal = function() {
        $modal.open({
            templateUrl: '/partials/login.html',
        });
    };
});
