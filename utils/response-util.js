class Response {
    code;
    status;
    message;
    data;

    constructor() {
        this.code = 0;
        this.status = '';
        this.message = '';
        this.data = undefined;
    }

    setResponse(code, status, message, data) {
        this.code = code;
        this.status = status;
        this.message = message;
        this.data = data;
    }

    getResponse() {
        return {
            code: this.code,
            status: this.status,
            message: this.message,
            data: this.data
        }
    }
}

module.exports = Response;