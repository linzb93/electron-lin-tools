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
    accounts: {
      id: number;
      platform?: string;
      name?: string;
      domain?: string;
    }[];
    setting: {
      pixel: 1 | 2;
      platform: 1 | 2;
    };
  };
  css: {
    pixio: 1 | 2;
    platform: 1 | 2;
    template: string;
  };
  ipc: string;
  sync: {
    user: string;
    password: string;
  };
}
