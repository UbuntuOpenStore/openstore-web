'use strict';

angular.module('openstore').filter('versionFix', function() {
    return function(version) {
        return version.replace(/__/g, '.');
    };
});
