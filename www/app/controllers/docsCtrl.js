var docsCtrl = function($scope, api) {
    api.apps.get('openstore.openstore-team').then(function(data) {
        $scope.data = {
            download: data.download,
            version: data.version
        };
    });
};

docsCtrl.$inject = ['$scope', 'api'];

module.exports = docsCtrl;
