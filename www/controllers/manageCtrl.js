'use strict';

angular.module('openappstore').controller('manageCtrl', function($scope, $http, $location, $modal, $timeout, Upload) {
    $scope.saving = false;
    $scope.loading = true;
    $scope.user = null;
    $scope.packages = [];
    $scope.file = null;
    $scope.error = null;

    $http.get('/auth/me').then(function(res) {
        $scope.user = res.data.data;

        if ($scope.user.role != 'admin') {
            $scope.user = null;
            $location.path('/auth/logout');
        }
        else {
            $scope.loading = true;
            return $http.get('/api/apps');
        }
    }, function() {
        $scope.user = null;
        $location.path('/auth/logout');
    })
    .then(function(res) {
        $scope.loading = false;
        if (res && res.data && res.data.data) {
            $scope.packages = res.data.data;
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

        modal = $modal.open({
            templateUrl: '/partials/packageEdit.html',
            scope: $scope
        });
    };

    $scope.cancel = function() {
        modal.close();
        $scope.error = null;
    };

    $scope.save = function(pkg) {
        $scope.saving = true;
        var method = 'POST';
        var url = '/api/apps?apikey=' + $scope.user.apikey;
        if (pkg._id) {
            method = 'PUT';
            url = '/api/apps/' + pkg.id + '?apikey=' + $scope.user.apikey;
        }

        Upload.upload({
            method: method,
            url: url,
            fields: {
                tagline: pkg.tagline,
                description: pkg.description,
                license: pkg.license,
                source: pkg.source,
                category: pkg.category,
            },
            file: $scope.file
        })
        .progress(function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
        })
        .error(function(data, status) {
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
            $http.get('/api/apps').then(function(res) {
                $scope.loading = false;
                $scope.packages = res.data.data;
            });
        });
    };

    $scope.remove = function(pkg) {
        bootbox.confirm('Are you sure you want to remove package "' + pkg.id + '"?', function(result) {
            if (result) {
                $timeout(function() {
                    $http.delete('/api/apps/' + pkg.id, {
                        params: {
                            apikey: $scope.user.apikey
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(function() {
                        console.log('successful delete');

                        $scope.loading = true;
                        return $http.get('/api/apps');
                    }, function(res) {
                        console.log('failed to delete', res);
                    })
                    .then(function(res) {
                        $scope.loading = false;
                        $scope.packages = res.data.data;
                    });
                });
            }
        });
    };

    $scope.setFile = function(files) {
        $scope.file = files[0];
    };
});
