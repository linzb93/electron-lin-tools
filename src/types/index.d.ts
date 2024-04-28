export interface asyncCallback<T = any> {
  (params?: T): Promise<any>;
}

export interface AnyObject {
  [name: string]: any;
}
