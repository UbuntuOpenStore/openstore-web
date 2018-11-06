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
                promise = axios.get(`${process.env.VUE_APP_API}/auth/me`)
                    .then(success)
                    .then((data) => {
                        user = data;
                        return user;
                    })
                    .catch(() => null);
            }

            return promise;
        },
    },

    apps: {
        search: (query) => axios.get(`${process.env.VUE_APP_API}/api/v3/apps`, {
            params: query,
        }).then(success),

        get: (id) => axios.get(`${process.env.VUE_APP_API}/api/v3/apps/${id}?channel=xenial`)
            .then(success),

        stats: () => axios.get(`${process.env.VUE_APP_API}/api/v3/stats`)
            .then(success),
    },

    categories: () => axios.get(`${process.env.VUE_APP_API}/api/v3/categories`)
        .then(success),

    manage: {
        search: (query, key) => axios.get(`${process.env.VUE_APP_API}/api/v3/manage?apikey=${key}`, {
            params: query,
        }).then(success),

        get: (id, key) => axios.get(`${process.env.VUE_APP_API}/api/v3/manage/${id}?apikey=${key}`)
            .then(success),

        create: (data, key) => axios.post(`${process.env.VUE_APP_API}/api/v3/manage/?apikey=${key}`, data)
            .then(success),

        update: (id, data, key) => axios.put(`${process.env.VUE_APP_API}/api/v3/manage/${id}?apikey=${key}`, data)
            .then(success),

        revision: (id, data, key) => axios.post(`${process.env.VUE_APP_API}/api/v3/manage/${id}/revision?apikey=${key}`, data)
            .then(success),
    },

    users: {
        getAll: (key) => axios.get(`${process.env.VUE_APP_API}/api/users?apikey=${key}`)
            .then(success),
    },
};
