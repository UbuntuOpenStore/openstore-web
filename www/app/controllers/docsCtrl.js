var angular = require('angular');

var docsCtrl = function($scope, api) {
    api.apps.get("openstore.openstore-team").then((data) => {
        $scope.data = {
            download: data.download,
            version: data.version
        };
    });
};

docsCtrl.$inject = ['$scope', 'api'];

module.exports = docsCtrl;
