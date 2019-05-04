// HTTP MIME types collection, key is file extension, value is a type
export const contentTypes: Map<string, string> = new Map<string,string>();
contentTypes.set('html', 'text/html');
contentTypes.set('js', 'text/javascript');
contentTypes.set('css', 'text/css');
contentTypes.set('json', 'application/json');
contentTypes.set('jpg', 'image/jpeg');
contentTypes.set('png', 'image/png');

// Response codes enum
export const responseCodes = {
    NotFound : 404,
    ServerError : 500,
    Success : 200
};
