'use strict';

angular.module('openappstore').controller('manageCtrl', function($scope, $http, $location, $modal, $timeout) {
    $scope.saving = false;
    $scope.loading = true;
    $scope.user = null;
    $scope.packages = [];

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
    }, function(res) {
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
            author: '',
            category: '',
            description: '',
            filesize: 0,
            icon: '',
            id: '',
            license: '',
            name: '',
            package: '',
            source: '',
            tagline: '',
            version: '',
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

    $scope.save = function(pkg) {
        $scope.saving = true;
        var method = 'POST';
        if (pkg._id) {
            method = 'PUT';
        }

        $http({
            method: method,
            url: '/api/apps',
            params: {
                apikey: $scope.user.apikey
            },
            data: pkg,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function(res) {
            $scope.saving = false;
            modal.close();

            $scope.loading = true;
            return $http.get('/api/apps');
        }, function(res) {
            $scope.saving = false;
            console.log('failed to save', res);
        })
        .then(function(res) {
            $scope.loading = false;
            $scope.packages = res.data.data;
        });
    };

    $scope.remove = function(pkg) {
        bootbox.confirm('Are you sure you want to remove package "' + pkg.id + '"?', function(result) {
            if (result) {
                $timeout(function() {
                    $http.delete('/api/apps', {
                        params: {
                            apikey: $scope.user.apikey
                        },
                        data: {
                            _id: pkg._id
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(function(res) {
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
});
