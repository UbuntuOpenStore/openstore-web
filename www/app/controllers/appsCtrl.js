var debounce = require('debounce');

var appsCtrl = function($scope, $rootScope, $state, $sce, api) {
    $scope.apps = [];
    $scope.app = null;
    $scope.tab = 'contents';
    $scope.manifest = false;

    $scope.type = 'click';
    $scope.query = {
        limit: 30,
        skip: 0,
        search: '',
    };

    $scope.page = 0;
    $scope.paging = {
        total: 0,
        pages: [],
    };

    $scope.setPage = function(page) {
        if (page < 0) {
            page = 0;
        }
        else if (page > ($scope.paging.total)) {
            page = $scope.paging.total;
        }

        $scope.page = page;

        $scope.query.skip = page * $scope.query.limit;
        refresh();
    };

    if ($state.is('snaps')) {
        $scope.type = 'snappy';

        $scope.query = {
            types: 'snappy',
        };
    }

    function _refresh() {
        api.apps.getAll($scope.query).then(function(data) {
            $scope.count = data.count;
            $scope.apps = data.packages;

            $scope.paging.total = Math.ceil(data.count / $scope.query.limit) - 1;

            var first = $scope.page - 2;
            var last = $scope.page + 2;

            if (first < 0) {
                last += Math.abs(first);
                first = 0;
            }

            if (last > $scope.paging.total) {
                first -= (last - $scope.paging.total);
                if (first < 0) {
                    first = 0;
                }

                last = $scope.paging.total;
            }

            var pages = [];
            for (var i = first; i <= last; i++) {
                pages.push(i);
            }

            $scope.paging.pages = pages;
        });
    }
    var refresh = debounce(_refresh, 300);

    $scope.$watch('query.search', function() {
        refresh();
    });

    //TODO split app into it's own controller
    if ($state.params.name) {
        api.apps.get($state.params.name).then(function(app) {
            $scope.app = app;
            $scope.app.video_url = $scope.app.video_url ? $sce.trustAsResourceUrl($scope.app.video_url) : '';
            $scope.tab = 'contents';
            $scope.manifest = false;

            if ($state.is('snap') && $scope.app.types.indexOf('snappy') == -1) {
                $state.go('app', {name: $scope.app.id});
            }
            else if ($state.is('app') && $scope.app.types.indexOf('snappy') > -1) {
                $state.go('snap', {name: $scope.app.id});
            }
        }).catch(function(err) {
            if (err.status == 404) {
                $scope.app = false;
            }
            else {
                //TODO more error handling
            }
        });
    }
    else {
        refresh();
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

appsCtrl.$inject = ['$scope', '$rootScope', '$state', '$sce', 'api'];

module.exports = appsCtrl;
