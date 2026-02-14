"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.onError = onError;
function notFound(req, res) {
    res.status(404).json({ status: false, message: 'Route not found' });
}
function onError(err, req, res, _next) {
    console.error(err);
    res
        .status(err.status || 500)
        .json({ status: false, message: err.message || 'Server error' });
}
