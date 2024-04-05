interface ApiItem {
  Class: any;
  path: string;
  propertyKey: string;
}

const apiList: ApiItem[] = [];
export const getApiList = () => apiList;

export function Route(url: string) {
  return function (
    target: any,
    propertyKey: any,
    descriptior?: TypedPropertyDescriptor<any>
  ) {
    descriptior.enumerable = true;
    apiList.push({
      Class: target.constructor,
      path: url,
      propertyKey,
    });
  };
}
