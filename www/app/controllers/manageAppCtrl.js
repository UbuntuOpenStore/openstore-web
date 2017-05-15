var manageAppCtrl = function($scope, $location, $timeout, $state, Upload, info, api) {
    $scope.saving = false;
    $scope.loading = true;
    $scope.user = null;
    $scope.file = null;
    $scope.error = null;
    $scope.categories = info.categories;
    $scope.licenses = info.licenses;
    $scope.users = [];
    $scope.keywords = '';
    $scope.name = '';

    api.auth.me().then(function(user) {
        $scope.user = user;

        $scope.loading = true;

        if ($scope.user.role == 'admin') {
            api.users.getAll($scope.user.apikey).then(function(users) {
                users.sort(function(a, b) {
                    if (a.role == 'admin' && b.role != 'admin') {
                        return -1;
                    }
                    else if (a.role != 'admin' && b.role == 'admin') {
                        return 1;
                    }
                    else if (a.name < b.name) {
                        return 1;
                    }
                    else if (a.name > b.name) {
                        return -1;
                    }

                    return 0;
                });

                users.forEach(function(user) {
                    user.name = user.name + ' - ' + (user.role || 'community');
                });

                $scope.users = users;
            });
        }

        if ($state.params.name == 'create') {
            return {
                published: false,
            };
        }
        else {
            return api.manage.get($scope.user.apikey, $state.params.name);
        }
    }).then(function(pkg) {
        $scope.loading = false;
        $scope.pkg = pkg;
        $scope.published = pkg ? pkg.published : false;
        $scope.keywords = pkg ? pkg.keywords.join(', ') : [];
        $scope.name = pkg ? pkg.name : '';

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

    $scope.getUrl = function() {
        return $location.absUrl().replace('manage', 'app');
    }

    $scope.save = function(pkg) {
        $scope.saving = true;
        $scope.success = false;

        var keywords = $scope.keywords.split(',');
        for (var i = 0; i < keywords.length; i++) {
            keywords[i] = keywords[i].trim();
        }

        var data = {
            name: pkg.name,
            published: pkg.published,
            category: pkg.category,
            changelog: pkg.changelog,
            description: pkg.description,
            license: pkg.license,
            maintainer: pkg.maintainer,
            source: pkg.source,
            tagline: pkg.tagline,
            screenshots: pkg.screenshots,
            keywords: keywords,
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
            $scope.success = false;
        })
        .success(function(response) {
            $scope.saving = false;
            $scope.file = null;
            $scope.error = null;
            $scope.success = true;
            $scope.name = pkg.name;

            $location.path('/manage/' + response.data.id);
            //TODO popup message that everything was saved
        });
    };

    $scope.setFile = function(files) {
        $scope.file = files[0];
    };
};

manageAppCtrl.$inject = ['$scope', '$location', '$timeout', '$state', 'Upload', 'info', 'api'];

module.exports = manageAppCtrl;
