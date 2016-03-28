var bootbox = require('bootbox');
var angular = require('angular');

var manageCtrl = function($scope, $location, $uibModal, $timeout, Upload, info, api) {
    $scope.saving = false;
    $scope.loading = true;
    $scope.user = null;
    $scope.packages = [];
    $scope.file = null;
    $scope.error = null;
    $scope.categories = info.categories;
    $scope.licenses = info.licenses;

    function refresh() {
        return api.apps.getAll().then(function(apps) {
            $scope.loading = false;
            $scope.packages = apps;
        });
    }

    api.auth.me().then(function(user) {
        $scope.user = user;

        if ($scope.user.role != 'admin') {
            $scope.user = null;
            $location.path('/auth/logout');
        }
        else {
            $scope.loading = true;
            return refresh();
        }
    });

    $scope.newPackage = function() {
        return {
            category: '',
            description: '',
            license: '',
            source: '',
            tagline: '',
        };
    };

    var modal = null;
    $scope.edit = function(pkg) {
        $scope.pkg = angular.copy(pkg);

        modal = $uibModal.open({
            templateUrl: '/app/partials/packageEdit.html',
            scope: $scope
        });
    };

    $scope.stats = function(pkg) {
        $scope.pkg = angular.copy(pkg);
        $scope.pkg.totalDownloads = 0;
        angular.forEach(pkg.downloads, function(downloads) {
            $scope.pkg.totalDownloads += downloads;
        });

        modal = $uibModal.open({
            templateUrl: '/app/partials/packageStats.html',
            scope: $scope
        });
    };

    $scope.cancel = function() {
        modal.close();
        $scope.error = null;
    };

    $scope.save = function(pkg) {
        $scope.saving = true;
        var data = {
            tagline: pkg.tagline,
            description: pkg.description,
            license: pkg.license,
            source: pkg.source,
            category: pkg.category,
        };

        var upload = null;
        if (pkg.id) {
            upload = api.apps.update($scope.user.apikey, pkg.id, data, $scope.file);
        }
        else {
            upload = api.apps.create($scope.user.apikey, data, $scope.file);
        }

        upload.error(function(data, status) {
            console.error(data, status);
            $scope.error = data.message;
            $scope.saving = false;
        })
        .success(function() {
            $scope.saving = false;
            $scope.file = null;
            $scope.error = null;
            modal.close();

            $scope.loading = true;
            refresh();
        });
    };

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

    $scope.setFile = function(files) {
        $scope.file = files[0];
    };
};

manageCtrl.$inject = ['$scope', '$location', '$uibModal', '$timeout', 'Upload', 'info', 'api'];

module.exports = manageCtrl;
