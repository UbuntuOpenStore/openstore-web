var usersCtrl = function($scope, $location, api) {
    $scope.user = null;
    $scope.users = [];

    function refresh() {
        return api.users.getAll($scope.user.apikey).then(function(users) {
            $scope.loading = false;
            $scope.users = users;
        });
    }

    api.auth.me().then(function(user) {
        $scope.user = user;

        if (!$scope.user || $scope.user.role != 'admin') {
            $scope.user = null;
            $location.path('/');
        }
        else {
            $scope.loading = true;
            return refresh();
        }
    });

    $scope.userChanged = function(user) {
        user.saving = true;
        api.users.update($scope.user.apikey, user._id, user.role).then(function() {
            user.saving = false;
        });
    };
};

usersCtrl.$inject = ['$scope', '$location', 'api'];

module.exports = usersCtrl;
