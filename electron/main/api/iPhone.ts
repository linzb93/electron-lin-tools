import express from 'express';
import {Notification, clipboard} from 'electron';
import bodyParser from 'body-parser';
import fs from 'node:fs';
import cors from 'cors';
import {mainPost} from '../plugins/utils';
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { HTTP_STATUS } from "../plugins/constant";

export default class extends Controller {
  private app;
  constructor() {
    super();
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ limit: '5mb' }));
    app.use(cors());
    
    // iPhone发往电脑
    app.post('/copy', (req, res) => {
      const {text} = req.body;
      const notice = new Notification({
        title: '温馨提醒',
        body: '收到来自iPhone的剪贴'
      });
      notice.show();
      clipboard.writeText(decodeURIComponent(text));
      res.send('ok');
    });

    // iPhone从电脑获取
    app.get('/copy-data', (req, res) => {
      const copyData = clipboard.readText();
      res.send(copyData);
    });

    // iPhone批量获取电脑图片
    app.get('/getImgList', async(req, res) => {
      const data = await mainPost({
        method: 'iPhone-get-img',
        data: {}
      });
      console.log(data);
      fs.createReadStream(data[0]).pipe(res);
    });
    // iPhone批量给电脑发送图片
    app.post('/sendImg', async (req, res) => {
      req.pipe(fs.createWriteStream('test.png'));
      const { file } = req.body;
      // await fs.writeFile(path.resolve(helper.desktop, '图片.png'), file);
      res.send('ok');
    });
    app.listen(5010);
    this.app = app;
  }
}
