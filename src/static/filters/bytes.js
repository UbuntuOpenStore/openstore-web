'use strict';

angular.module('openappstore').filter('bytes', function() {
    return function(bytes) {
        var unit = 'B';

        if (!bytes) {
            bytes = 0;
        }
        else if (bytes > 1024) {
            bytes /= 1024;
            unit = 'KB';

            if (bytes > 1024) {
                bytes /= 1024;
                unit = 'MB';

                if (bytes > 1024) {
                    bytes /= 1024;
                    unit = 'GB';

                    if (bytes > 1024) {
                        bytes /= 1024;
                        unit = 'TB';
                    }
                }
            }
        }

        return bytes.toFixed(1) + ' ' + unit;
    };
});
