var manageAppCtrl = function($scope, $location, $timeout, $state, Upload, info, api) {
    $scope.saving = false;
    $scope.loading = true;
    $scope.user = null;
    $scope.file = null;
    $scope.error = null;
    $scope.categories = info.categories;
    $scope.licenses = info.licenses;
    $scope.users = [];
    $scope.trustedAdminUsers = [];

    api.auth.me().then(function(user) {
        $scope.user = user;

        if (!$scope.user || ($scope.user.role != 'admin' && $scope.user.role != 'trusted')) {
            $scope.user = null;
            $location.path('/auth/logout');
        }
        else {
            $scope.loading = true;

            if ($scope.user.role == 'admin') {
                api.users.getAll($scope.user.apikey).then(function(users) {
                    $scope.users = users;

                    var trustedAdminUsers = [];
                    for (var index in users) {
                        if (users[index].role == 'admin' || users[index].role == 'trusted') {
                            trustedAdminUsers.push(users[index]);
                        }
                    }

                    $scope.trustedAdminUsers = trustedAdminUsers;
                });
            }

            if ($state.params.name == 'create') {
                return {
                    category: '',
                    changelog: '',
                    description: '',
                    license: '',
                    source: '',
                    tagline: '',
                    screenshots: [],
                };
            }
            else {
                return api.manage.get($scope.user.apikey, $state.params.name);
            }
        }
    }).then(function(pkg) {
        $scope.loading = false;
        $scope.pkg = pkg;

        $timeout(function() {
            var uploadcareWidget = window.uploadcare.MultipleWidget('#uploadcare');
            if ($scope.pkg.screenshots && $scope.pkg.screenshots.length > 0) {
                var screenshot = $scope.pkg.screenshots[0];
                var pos = screenshot.indexOf('/nth');
                var value = screenshot.substring(0, pos).replace('https://ucarecdn.com/', '');

                uploadcareWidget.value(value);
            }

            uploadcareWidget.onUploadComplete(function(info) {
                var screenshots = [];
                for (var i = 0; i < info.count; i++) {
                    screenshots.push(info.cdnUrl + 'nth/' + i + '/-/format/jpeg/-/quality/lightest/');
                }

                $scope.pkg.screenshots = screenshots;
            });
        });
    });

    $scope.save = function(pkg) {
        $scope.saving = true;
        var data = {
            category: pkg.category,
            changelog: pkg.changelog,
            description: pkg.description,
            license: pkg.license,
            maintainer: pkg.maintainer,
            source: pkg.source,
            tagline: pkg.tagline,
            screenshots: pkg.screenshots,
        };

        var upload = null;
        if (pkg.id) {
            upload = api.manage.update($scope.user.apikey, pkg.id, data, $scope.file);
        }
        else {
            if (!data.maintainer) {
                data.maintainer = $scope.user._id;
            }

            upload = api.manage.create($scope.user.apikey, data, $scope.file);
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

            $location.path('/manage');
        });
    };

    $scope.setFile = function(files) {
        $scope.file = files[0];
    };
};

manageAppCtrl.$inject = ['$scope', '$location', '$timeout', '$state', 'Upload', 'info', 'api'];

module.exports = manageAppCtrl;
