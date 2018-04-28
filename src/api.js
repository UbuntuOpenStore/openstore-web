import axios from 'axios';

function success(res) {
    return res.data.data;
}

let user = null;

export default {
    auth: {
        me: () => {
            let promise = null;
            if (user) {
                promise = new Promise((resolve) => {
                    resolve(user);
                });
            }
            else {
                promise = axios.get(`${process.env.API}/auth/me`)
                    .then(success)
                    .then((data) => {
                        user = data;
                        return user;
                    })
                    .catch(() => {
                        return null;
                    });
            }

            return promise;
        },
    },

    apps: {
        search: (query) => {
            return axios.get(`${process.env.API}/api/v3/apps`, {
                params: query,
            }).then(success);
        },

        get: (id) => {
            return axios.get(`${process.env.API}/api/v3/apps/${id}`).then(success);
        },

        stats: () => {
            return axios.get(`${process.env.API}/api/v3/stats`).then(success);
        },
    },

    categories: () => {
        // TODO implement caching
        return axios.get(`${process.env.API}/api/v3/categories`).then(success);
    },

    manage: {
        search: (query, key) => {
            return axios.get(`${process.env.API}/api/v3/manage?apikey=${key}`, {
                params: query,
            }).then(success);
        },

        get: (id, key) => {
            return axios.get(`${process.env.API}/api/v3/manage/${id}?apikey=${key}`).then(success);
        },

        create: (data, key) => {
            return axios.post(`${process.env.API}/api/v3/manage/?apikey=${key}`, data).then(success);
        },

        update: (id, data, key) => {
            return axios.put(`${process.env.API}/api/v3/manage/${id}?apikey=${key}`, data).then(success);
        },

        revision: (id, data, key) => {
            return axios.post(`${process.env.API}/api/v3/manage/${id}/revision?apikey=${key}`, data).then(success);
        },
    },

    users: {
        getAll: (key) => {
            return axios.get(`${process.env.API}/api/users?apikey=${key}`).then(success);
        },
    },
};
