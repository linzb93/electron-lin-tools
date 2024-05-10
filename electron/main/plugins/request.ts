import { net } from 'electron';

interface Body {
    data: {
        [key:string]: any
    }
}

const methods = ['get', 'post'];
type RequestParams = Body & {
    url: string;
    method: 'get' | 'post';
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

function request(param: RequestParams): Promise<any> {
    return httpRequest(param);
}

request.get = function (url: string, param: Body['data']): Promise<any> {
    return httpRequest({
        url,
        method: 'get',
        data: param
    });
};
request.post = function (url: string, param: Body['data']): Promise<any> {
    return httpRequest({
        url,
        method: 'post',
        data: param
    });
};

export default request;