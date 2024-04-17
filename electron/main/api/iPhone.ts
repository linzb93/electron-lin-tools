import express from "express";
import { Notification, clipboard } from "electron";
import fs from "node:fs";
import multer from "multer";
import intoStream from "into-stream";
import { tempPath } from "../plugins/constant";
import { mainPost } from "../plugins/utils";
import { join, basename } from "node:path";
import { config } from "../plugins/server";

const { Router } = express;
const router = Router();
const upload = multer();

// iPhone发往电脑
router.post("/send-copy-data", (req, res) => {
  const { text } = req.body;
  const notice = new Notification({
    title: "温馨提醒",
    body: "收到来自iPhone的剪贴",
  });
  notice.show();
  clipboard.writeText(decodeURIComponent(text));
  res.send("ok");
});

// iPhone从电脑获取
router.get("/get-copy-data", (_, res) => {
  const copyData = clipboard.readText();
  if (copyData !== "") {
    res.send(encodeURIComponent(copyData));
    return;
  }
  const img = clipboard.readImage();
  if (img.getSize().width) {
    intoStream(img.getBitmap()).pipe(res);
  }
});

// iPhone批量获取电脑图片地址
router.get("/get-img-list", async (_, res) => {
  const list = (await mainPost({
    method: "iPhone-get-img",
    data: {},
  })) as any[];
  res.send({
    list,
  });
});

// iPhone下载电脑图片
router.get("/get-img", (req, res) => {
  const imgPath = req.query.path as string;
  fs.createReadStream(imgPath).pipe(res);
});

// 当数据一段时间内不再变化时，触发事件
function waitUntil(getObs: Function, { delta, interval = 1000 }) {
  return new Promise((resolve) => {
    let rawData = 0;
    let prevTime = Date.now();
    const timer = setInterval(() => {
      const obs = getObs();
      const now = Date.now();
      if (obs !== rawData) {
        rawData = obs;
        prevTime = now;
      } else if (now - prevTime >= delta) {
        clearInterval(timer);
        resolve(null);
      }
    }, interval);
  });
}

// iPhone给电脑发送图片
router.post("/send-img", upload.single("file"), async (req, res) => {
  const uid = Date.now();
  const filename = join(tempPath, `${uid}.jpg`);
  intoStream(req.file.buffer).pipe(fs.createWriteStream(filename));
  const notice = new Notification({
    title: "温馨提醒",
    body: "收到来自iPhone的图片 ",
  });
  notice.show();
  mainPost({
    method: "iPhone-upload-img",
    data: {
      url: `http://localhost:${config.port}${config.static}/${uid}.jpg`,
    },
  });
  res.send("ok");
});

export default router;
