declare module 'ali-oss' {
    interface OssConfig {
      region: string;
      accessKeyId: string;
      accessKeySecret: string;
      bucket: string;
      timeout: number;
    }
    interface OSSObject {
        objects: {
            size: number;
            name?: string;
            type:string;
        }[],
        prefixes: string[]
    }
    export default class OSS {
      constructor(config: OssConfig);
      put(
        uploadName: string,
        localPath: string | Buffer
      ): Promise<{
        name: string;
      }>
      listV2(obj: {
        prefix: string;
        delimiter: string;
        'max-keys': number;
      }):Promise<OSSObject>
      delete(file: string): Promise<void>
    }
  }