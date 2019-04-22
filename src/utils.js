import * as Sentry from '@sentry/browser';

const IGNORE_STATUSES = [400, 401, 403, 404];

export default {
    captureException(err) {
        Sentry.withScope((scope) => {
            if (err && err.response && err.response.data) {
                scope.setExtra('response', err.response.data);
            }

            if (err && err.response && err.response.status) {
                if (IGNORE_STATUSES.includes(err.response.status)) {
                    return;
                }

                scope.setTag('status', err.response.status);
            }

            Sentry.captureException(err);
        });
    },
};
