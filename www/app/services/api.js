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
            getAll: function(query) {
                return $http.get(process.env.API + '/api/apps', {
                    params: query,
                }).then(success);
            },

            get: function(id) {
                return $http.get(process.env.API + '/api/apps/' + id).then(success);
            },
        },

        manage: {
            getAll: function(key) {
                return $http.get(process.env.API + '/api/manage/apps' + '?apikey=' + key).then(success);
            },

            get: function(key, id) {
                return $http.get(process.env.API + '/api/manage/apps/' + id + '?apikey=' + key).then(success);
            },

            create: function(key, data, file) {
                return Upload.upload({
                    method: 'POST',
                    url: process.env.API + '/api/manage/apps?apikey=' + key,
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
                    url: process.env.API + '/api/manage/apps/' + id + '?apikey=' + key,
                    fields: data,
                    file: file,
                })
                .error(function(data, status) {
                    console.error(data, status);
                });
            },

            remove: function(key, id) {
                return $http.delete(process.env.API + '/api/manage/apps/' + id, {
                    params: {
                        apikey: key
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            },
        },

        users: {
            getAll: function(key) {
                return $http.get(process.env.API + '/api/users', {
                    params: {
                        apikey: key
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(success);
            },

            get: function(key, id) {
                return $http.get(process.env.API + '/api/users/' + id, {
                    params: {
                        apikey: key
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(success);
            },

            update: function(key, id, role) {
                return $http.put(process.env.API + '/api/users/' + id + '?apikey=' + key, {
                    role: role,
                }).then(success);
            },
        }
    };
};

api.$inject = ['$http', 'Upload'];

module.exports = api;
