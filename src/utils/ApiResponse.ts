export default class ApiResponse {
  static response = (
    statusCode: number,
    statusMessage: string,
    data: any,
    headers = {}
  ) => {
    return {
      statusCode,
      headers: Object.assign(
        {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
          "Access-Control-Allow-Headers": "x-app-token",
        },
        headers
      ),
      body: JSON.stringify({
        status: statusMessage,
        data,
      }),
    };
  };

  static success = (data: any, statusMessage: string = "SUCCESS") => {
    return ApiResponse.response(200, statusMessage, data);
  };
  static validationKeysMissing = (statusMessage: string = "ERROR") => {
    return ApiResponse.response(400, statusMessage, "Token Mismatch");
  };
  static badRequest = (statusMessage: string = "ERROR") => {
    return ApiResponse.response(500, statusMessage, "Internal Server Error");
  };
  static methodNotAllowed = (statusMessage: string) => {
    return ApiResponse.response(405, "ERROR", {
      message: statusMessage,
    });
  };
}
