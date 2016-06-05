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

        if (!$scope.user || $scope.user.role != 'admin') {
            $scope.user = null;
            $location.path('/auth/logout');
        }
        else {
            $scope.loading = true;

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

            if ($state.params.name == 'create') {
                return {
                    category: '',
                    changelog: '',
                    description: '',
                    license: '',
                    source: '',
                    tagline: '',
                };
            }
            else {
                return api.apps.get($state.params.name);
            }
        }
    }).then(function(pkg) {
        $scope.loading = false;
        $scope.pkg = pkg;
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
        };

        var upload = null;
        if (pkg.id) {
            upload = api.apps.update($scope.user.apikey, pkg.id, data, $scope.file);
        }
        else {
            if (!data.maintainer) {
                data.maintainer = $scope.user._id;
            }

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

            $location.path('/manage');
        });
    };

    $scope.setFile = function(files) {
        $scope.file = files[0];
    };
};

manageAppCtrl.$inject = ['$scope', '$location', '$timeout', '$state', 'Upload', 'info', 'api'];

module.exports = manageAppCtrl;
