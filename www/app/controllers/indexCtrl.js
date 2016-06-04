var angular = require('angular');
var jquery = require('jquery');

var indexCtrl = function($scope, $rootScope, $state, $uibModal, $location, $sce, api) {
    $scope.$state = $state;
    $scope.login = $sce.trustAsResourceUrl(process.env.API + '/auth/ubuntu');

    var url = $location.protocol() + '://' + $location.host() + '/';
    var defaultTitle = 'OpenStore';
    var defaultOg = {
        title: defaultTitle,
        description: 'OpenStore for Ubuntu Touch',
        image: url + 'assets/img/logo.png',
        url: url + 'apps',
    };

    $rootScope.title = defaultTitle;
    $rootScope.og = angular.copy(defaultOg);

    $rootScope.$on('$stateChangeStart', function() {
        $rootScope.title = defaultTitle;
        $rootScope.og = angular.copy(defaultOg);

        jquery('#menu').collapse('hide');
    });

    $rootScope.setOG = function(title, og) {
        og = angular.extend(defaultOg, og);
        og.title = title;
        og.image = og.image.replace('{url}', url);
        og.url = og.url.replace('{url}', url);

        if (title != defaultTitle) {
            title = title + ' - ' + defaultTitle;
        }

        $rootScope.title = title;
        $rootScope.og = og;
    };

    $scope.loggedin = false;
    var current_user = null;
    api.auth.me().then(function(user) {
        if (user) {
            $scope.loggedin = true;
            current_user = user;
        }
        else {
            $scope.loggedin = false;
            current_user = null;
        }
    });
};

indexCtrl.$inject = ['$scope', '$rootScope', '$state', '$uibModal', '$location', '$sce', 'api'];

module.exports = indexCtrl;
