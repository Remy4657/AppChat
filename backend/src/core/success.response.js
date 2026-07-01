const StatusCode = {
    CREATED: 201,
    OK: 200
}
const ReasonStatusCode = {
    CREATED: "Created",
    OK: "Success"
}
class SuccessResponse {
    static ok(res, metadata = null, message, options = {}) {

        const response = {
            status: 'success',
            message: message ?? ReasonStatusCode.OK,
            ...options
        }
        if (metadata) {
            response.data = metadata;
        }
        return res.status(StatusCode.OK).json(response);
    }
    static created(res, metadata = null, message, options = {}) {
        const response = {
            status: 'success',
            message: message ?? ReasonStatusCode.CREATED,
            ...options,
        }
        if (metadata) {
            response.data = metadata;
        }
        return res.status(StatusCode.CREATED).json(response);
    }
}
export default SuccessResponse;