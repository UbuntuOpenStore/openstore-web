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

        if (!$scope.user || ($scope.user.role != 'admin' && $scope.user.role != 'trusted')) {
            $scope.user = null;
            $location.path('/auth/logout');
        }
        else {
            $scope.loading = true;

            return refresh();
        }
    });

    $scope.remove = function(pkg) {
        bootbox.confirm('Are you sure you want to remove package "' + pkg.id + '"?', function(result) {
            if (result) {
                $timeout(function() {
                    api.apps.remove($scope.user.apikey, pkg.id).then(function() {
                        $scope.loading = true;

                        return refresh();
                    }, function(res) {
                        console.log('failed to delete', res);
                    });
                });
            }
        });
    };
};

manageCtrl.$inject = ['$scope', '$location', '$timeout', 'info', 'api'];

module.exports = manageCtrl;
