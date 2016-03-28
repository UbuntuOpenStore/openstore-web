var versionFix = function() {
    return function(version) {
        return version.replace(/__/g, '.');
    };
};

module.exports = versionFix;
