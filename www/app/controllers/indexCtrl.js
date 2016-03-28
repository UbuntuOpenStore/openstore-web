var angular = require('angular');
var jquery = require('jquery');

var indexCtrl = function($scope, $rootScope, $state, $uibModal, $location, $sce) {
    $scope.$state = $state;
    $scope.login = $sce.trustAsResourceUrl(process.env.API + '/auth/ubuntu');

    $rootScope.loginModal = function() {
        $uibModal.open({
            templateUrl: '/app/partials/login.html',
            scope: $scope,
        });
    };

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
};

indexCtrl.$inject = ['$scope', '$rootScope', '$state', '$uibModal', '$location', '$sce'];

module.exports = indexCtrl;
