/**
 * name : middlewares/authenticator
 * author : Aman Kumar Gupta
 * Date : 04-Nov-2021
 * Description : Validating authorized requests
 */

const jwt = require('jsonwebtoken');

const httpStatusCode = require('../generics/http-status');
const apiResponses = require('../constants/api-responses');
const common = require('../constants/common');
const requests = require('../generics/requests');
const endpoints = require('../constants/endpoints');

module.exports = async function (req, res, next) {
    try {

        let internalAccess = false;
        await Promise.all(common.internalAccessUrs.map(async function (path) {

            if (req.path.includes(path)) {
                if (req.headers.internal_access_token && process.env.INTERNAL_ACCESS_TOKEN == req.headers.internal_access_token) {
                    internalAccess = true;
                }
            }
        }));

        if (internalAccess == true) {
            next();
            return;
        }

        common.guestUrls.map(function (path) {
            if (req.path.includes(path)) {
                return next();   
            }
        });

        const authHeader = req.get('X-auth-token');
        if (!authHeader) {
            throw common.failureResponse({
                message: apiResponses.UNAUTHORIZED_REQUEST,
                statusCode: httpStatusCode.unauthorized,
                responseCode: 'UNAUTHORIZED'
            });
        }
        const authHeaderArray = authHeader.split(' ');
        if (authHeaderArray[0] !== 'bearer') {
            throw common.failureResponse({
                message: apiResponses.UNAUTHORIZED_REQUEST,
                statusCode: httpStatusCode.unauthorized,
                responseCode: 'UNAUTHORIZED'
            });
        }
        try {
            decodedToken = jwt.verify(authHeaderArray[1], process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            err.statusCode = httpStatusCode.unauthorized;
            err.responseCode = 'UNAUTHORIZED';
            err.message = apiResponses.ACCESS_TOKEN_EXPIRED;
            throw err;
        }

        if (!decodedToken) {
            throw common.failureResponse({
                message: apiResponses.UNAUTHORIZED_REQUEST,
                statusCode: httpStatusCode.unauthorized,
                responseCode: 'UNAUTHORIZED'
            });
        }

        /* Invalidate token when user role is updated, say from mentor to mentee or vice versa */
        const userBaseUrl = process.env.USER_SERIVCE_HOST + process.env.USER_SERIVCE_BASE_URL;
        const profileUrl = userBaseUrl + endpoints.USER_PROFILE_DETAILS + '/' + decodedToken.data._id;

        const user = await requests.get(profileUrl, null, true);

        if (user.data.result.isAMentor !== decodedToken.data.isAMentor) {
            throw common.failureResponse({
                message: apiResponses.USER_ROLE_UPDATED,
                statusCode: httpStatusCode.unauthorized,
                responseCode: 'UNAUTHORIZED'
            });
        }

        req.decodedToken = {
            _id: decodedToken.data._id,
            email: decodedToken.data.email,
            isAMentor: decodedToken.data.isAMentor,
            name: decodedToken.data.name,
            token: authHeader
        };
        next();
    } catch (err) {
        next(err);
    }
};