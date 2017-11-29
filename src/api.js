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
            return axios.get(`${process.env.API}/api/v2/apps`, {
                params: query,
            }).then(success);
        },

        get: (id) => {
            return axios.get(`${process.env.API}/api/v2/apps/${id}`).then(success);
        },
    },

    categories: () => {
        // TODO implement caching
        return axios.get(`${process.env.API}/api/v2/categories`).then(success);
    },

    manage: {
        search: (query, key) => {
            return axios.get(`${process.env.API}/api/v2/manage/apps?apikey=${key}`, {
                params: query,
            }).then(success);
        },

        get: (id, key) => {
            return axios.get(`${process.env.API}/api/v2/manage/apps/${id}?apikey=${key}`).then(success);
        },

        create: (data, key) => {
            return axios.post(`${process.env.API}/api/v2/manage/apps/?apikey=${key}`, data).then(success);
        },
    },
};
