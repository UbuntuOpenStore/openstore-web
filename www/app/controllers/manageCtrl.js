var bootbox = require('bootbox');

var manageCtrl = function($scope, $location, $timeout, info, api) {
    $scope.loading = true;
    $scope.user = null;
    $scope.packages = [];

    function refresh() {
        return api.manage.getAll($scope.user.apikey).then(function(apps) {
            $scope.loading = false;
            $scope.packages = apps;
        });
    }

    //TODO don't autenticate every time, store the logged in status & user data
    api.auth.me().then(function(user) {
        $scope.user = user;

        $scope.loading = true;
        return refresh();
    });
};

manageCtrl.$inject = ['$scope', '$location', '$timeout', 'info', 'api'];

module.exports = manageCtrl;
