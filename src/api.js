import axios from 'axios';

function success(res) {
    return res.data.data;
}

export default {
    auth: {
        me: () => {
            return axios.get(`${process.env.API}/auth/me`)
                .then(success)
                .catch(() => {
                    return null;
                });
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
};
