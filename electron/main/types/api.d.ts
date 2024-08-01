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
    appKey: string;
    platform?: string;
    publicPath?: string;
  }[];
  oss: {
    accounts: {
      id: number;
      platform?: string;
      name?: string;
      domain?: string;
      shortcut?: string;
    }[];
    setting: {
      pixel: 1 | 2;
      platform: 1 | 2;
      previewType: 1 | 2;
      fasterEnter: 1 | 2;
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
  oa: {
    apiPrefix: string;
  };
  monitor: {
    siteId: string;
    name: string;
  }[];
  schedule: {
    inited: boolean;
    git: {
      dirs: {
        path: string;
        name: string;
      }[];
      period: 1 | 2;
      weeks: number[];
    };
    monitor: {
      file: string;
      timeAfterPublish: number;
      timeNextDay: number;
      weekDay: number;
      timeEveryWeek: string;
    };
  };
}
