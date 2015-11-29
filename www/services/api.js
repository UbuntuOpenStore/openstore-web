'use strict';

angular.module('openstore').factory('api', function($http, Upload) {
    function success(res) {
        return res.data.data;
    }

    return {
        auth: {
            me: function() {
                return $http.get('/auth/me').then(success, function() {
                    return null;
                });
            },
        },
        apps: {
            getAll: function() {
                return $http.get('/api/apps').then(success);
            },

            get: function(id) {
                return $http.get('/api/apps/app').then(success);
            },

            create: function(key, data, file) {
                return Upload.upload({
                    method: 'POST',
                    url: '/api/apps?apikey=' + key,
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
                    url: '/api/apps/' + id + '?apikey=' + key,
                    fields: data,
                    file: file,
                })
                .error(function(data, status) {
                    console.error(data, status);
                });
            },

            remove: function(key, id) {
                return $http.delete('/api/apps/' + id, {
                    params: {
                        apikey: key
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            },
        },
    }
});
