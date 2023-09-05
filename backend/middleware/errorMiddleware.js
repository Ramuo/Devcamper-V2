//This middleware will be called only if no other middleware handlled the request;
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// This middleware will be called if any other middleware throws an error.
// It will check the status code and set it to 500 if it is 200.
// It will then check the error name and kind to see if it is a CastError. If it is, it will set the status code to 404 and the message to `Resource not found`.
// It will then send the status code, message, and stack trace to the client.

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    let message = err.message;

    //Check for Mongoose bad ObjectId
    if(err.name === 'CastError' && err.kind === 'ObjectId'){
        message = `Ressource not Found`;
        statusCode = 404;
    };

    res.status(statusCode).json({
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export { notFound, errorHandler };