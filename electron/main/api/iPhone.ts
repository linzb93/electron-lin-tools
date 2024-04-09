import express from 'express';
import {Notification, clipboard} from 'electron';
import bodyParser from 'body-parser';
import fs from 'node:fs';
import cors from 'cors';
import multer from "multer";
import intoStream from "into-stream";
import {mainPost} from '../plugins/utils';
import Controller from "../plugins/route/Controller";
import { HTTP_STATUS } from "../plugins/constant";

export default class extends Controller {
  constructor() {
    super();
    const app = express();
    const upload = multer();
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
    app.get('/copy-data', (_, res) => {
      const copyData = clipboard.readText();
      res.send(encodeURIComponent(copyData));
    });

    // iPhone批量获取电脑图片地址
    app.get('/get-img-list', async(_, res) => {
      const data = await mainPost({
        method: 'iPhone-get-img',
        data: {}
      });
      res.send({
        list: data
      });
    });

    // iPhone下载电脑图片
    app.get('/get-img', (req,res) => {
      const { path } = req.query;
      fs.createReadStream(path).pipe(res);
    })
    // iPhone给电脑发送图片
    app.post('/send-image', upload.single("file"), async (req, res) => {
      const uid = parseInt((Math.random() * 10e9).toString());
      const filename = `${uid}.jpg`;
      intoStream(req.file.buffer).pipe(fs.createWriteStream(filename));
      res.send('ok');
    });
    app.listen(5010);
  }
}
