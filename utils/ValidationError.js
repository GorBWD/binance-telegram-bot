
module.exports = class ValidationError extends Error {
    constructor(message) {
        super(message);

        this.statusCode = 422;
    }
}