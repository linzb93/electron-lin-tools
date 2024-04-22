interface AnyObject {
  [key: string]: any;
}

export interface Request<T = AnyObject> {
  params: T;
  path: string;
}

export interface Database {
  lastModifiedTime: string;
  vue: {
    name: string;
    path: string;
    serveUrl: string;
  }[];
  oss: {
    id: string;
    platform?: string;
    name?: string;
  }[];
  ipc: string;
  sync: {
    user: string;
    password: string;
  }
}