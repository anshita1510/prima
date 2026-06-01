"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.validateParams = exports.validateQuery = exports.validateBody = void 0;
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors
            });
        }
    };
};
exports.validateBody = validateBody;
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.query);
            next();
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors
            });
        }
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.params);
            next();
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors
            });
        }
    };
};
exports.validateParams = validateParams;
// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    if (err.name === 'PrismaClientKnownRequestError') {
        return res.status(400).json({
            success: false,
            message: 'Database error occurred'
        });
    }
    return res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
};
exports.errorHandler = errorHandler;
