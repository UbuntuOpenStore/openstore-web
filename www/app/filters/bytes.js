var bytes = function() {
    return function(b) {
        var unit = 'B';

        if (!b) {
            b = 0;
        }
        else if (b > 1024) {
            b /= 1024;
            unit = 'KB';

            if (b > 1024) {
                b /= 1024;
                unit = 'MB';

                if (b > 1024) {
                    b /= 1024;
                    unit = 'GB';

                    if (b > 1024) {
                        b /= 1024;
                        unit = 'TB';
                    }
                }
            }
        }

        return b.toFixed(1) + ' ' + unit;
    };
};

module.exports = bytes;
