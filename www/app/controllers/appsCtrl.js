var appsCtrl = function($scope, $rootScope, $state, api) {
    $scope.apps = [];
    $scope.app = null;
    $scope.tab = 'contents';
    $scope.manifest = false;

    $scope.type = 'click';
    var query = {};
    if ($state.is('snaps')) {
        $scope.type = 'snappy';

        query = {
            types: 'snappy',
        };
    }

    //TODO split app into it's own controller
    if ($state.params.name) {
        api.apps.get($state.params.name).then(function(app) {
            $scope.app = app;
            $scope.tab = 'contents';
            $scope.manifest = false;

            if ($state.is('snap') && $scope.app.types.indexOf('snappy') == -1) {
                $state.go('app', {name: $scope.app.id});
            }
            else if ($state.is('app') && $scope.app.types.indexOf('snappy') > -1) {
                $state.go('snap', {name: $scope.app.id});
            }
        });
    }
    else {
        api.apps.getAll(query).then(function(apps) {
            $scope.apps = apps;
        });
    }

    $scope.getUrl = function(app) {
        var url = '/app/' + app.id;
        if (app.types.indexOf('snappy') > -1) {
            url = '/snap/' + app.id;
        }

        return url;
    }

    $scope.$watch('app', function() {
        if ($scope.app) {
            $rootScope.setOG($scope.app.name, {
                title: $scope.app.name,
                description: $scope.app.tagline,
                image: $scope.app.icon,
                url: '{url}/app/' + $scope.app.id,
            });
        }
        else {
            $rootScope.setOG('OpenStore', {});
        }
    }, true);

    $scope.appType = function(hook) {
        var type = 'App';
        if (hook.dekstop) {
            type = 'App';
        }
        else if (hook.scope) {
            type = 'Scope';
        }
        else if (hook['push-helper']) {
            type = 'Push Helper';
        }

        return type;
    };
};

appsCtrl.$inject = ['$scope', '$rootScope', '$state', 'api'];

module.exports = appsCtrl;
