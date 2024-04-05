interface AnyObject {
  [key: string]: any;
}

export interface Request<T = AnyObject> {
  params: T;
  path: string;
}

export interface TableItem {
  database: string;
  table?: string;
}
