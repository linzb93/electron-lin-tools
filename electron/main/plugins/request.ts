import { net } from 'electron';

interface Body {
    data: {}
}

const methods = ['get', 'post'];
type RequestParams = Body & {
    url: string;
    method: string;
}

function httpRequest(param: RequestParams) {
    return new Promise((resolve, reject) => {
        net.fetch(param.url, {
            method: param.method,
            body: JSON.stringify(param.data)
        })
            .then(response => {
                if (response.ok) {
                    resolve(response.body);
                } else {
                    reject(response.body);
                }
            });
    });
}

function request(param: RequestParams) {
    return httpRequest(param);
}

methods.forEach(method => {
    request[method] = function (url: string, param: Body) {
        return httpRequest({
            url,
            method,
            ...param
        });
    }
})

export default request;