var permission = function() {
    return function(str) {
        return str.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); //To title Case
        });
    };
};

module.exports = permission;
