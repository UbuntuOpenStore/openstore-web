var api = function($http, Upload) {
    function success(res) {
        return res.data.data;
    }

    return {
        auth: {
            me: function() {
                return $http.get(process.env.API + '/auth/me').then(success, function() {
                    return null;
                });
            },
        },
        apps: {
            getAll: function() {
                return $http.get(process.env.API + '/api/apps').then(success);
            },

            get: function(id) {
                return $http.get(process.env.API + '/api/apps/' + id).then(success);
            },

            create: function(key, data, file) {
                return Upload.upload({
                    method: 'POST',
                    url: process.env.API + '/api/apps?apikey=' + key,
                    fields: data,
                    file: file,
                })
                .error(function(data, status) {
                    console.error(data, status);
                });
            },

            update: function(key, id, data, file) {
                return Upload.upload({
                    method: 'PUT',
                    url: process.env.API + '/api/apps/' + id + '?apikey=' + key,
                    fields: data,
                    file: file,
                })
                .error(function(data, status) {
                    console.error(data, status);
                });
            },

            remove: function(key, id) {
                return $http.delete(process.env.API + '/api/apps/' + id, {
                    params: {
                        apikey: key
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            },
        },
    };
};

api.$inject = ['$http', 'Upload'];

module.exports = api;
