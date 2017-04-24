var logger = require('../utils/logger');

function success(res, data, message) {
    res.send({
        success: true,
        data: data,
        message: message ? message : null
    });
}

function error(res, message, code) {
    logger.error('server: ' + message);

    res.status(code ? code : 500);
    res.send({
        success: false,
        data: null,
        message: message
    });
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user && req.user.role == 'admin') {
        next();
    }
    else {
        error(res, 'Forbidden', 403);
    }
}

function isAdminOrTrusted(req, res, next) {
    if (req.isAuthenticated() && req.user && (req.user.role == 'admin' || req.user.role == 'trusted')) {
        next();
    }
    else {
        error(res, 'Forbidden', 403);
    }
}

function isAdminUser(req) {
    var ok = false;
    if (req.isAuthenticated()) {
        if (req.user.role == 'admin') {
            ok = true;
        }
    }

    return ok;
}

function isAdminOrTrustedUser(req) {
    var ok = false;
    if (req.isAuthenticated()) {
        if (req.user.role == 'admin' || req.user.role == 'trusted') {
            ok = true;
        }
    }

    return ok;
}

function isAdminOrTrustedOwner(req, pkg) {
    var ok = false;
    if (req.isAuthenticated()) {
        if (req.user.role == 'admin') {
            ok = true;
        }
        else if (req.user.role == 'trusted' && pkg && pkg.maintainer == req.user._id) {
            ok = true;
        }
    }

    return ok;
}

exports.success = success;
exports.error = error;
exports.isAdmin = isAdmin;
exports.isAdminOrTrusted = isAdminOrTrusted;
exports.isAdminOrTrustedOwner = isAdminOrTrustedOwner;
exports.isAdminUser = isAdminUser;
exports.isAdminOrTrustedUser = isAdminOrTrustedUser;
