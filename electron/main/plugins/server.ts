import express from "express";
import fs from "node:fs";
import bodyParser from "body-parser";
import cors from "cors";
import iPhoneRouter from "../api/iPhone";
fs.accessSync(tempPath);
import { tempPath, serverStaticPath } from "./constant";

export const config = {
  port: 5010,
  static: "/assets",
  server: "/pages",
};

try {
  fs.accessSync(tempPath);
  fs.accessSync(serverStaticPath);
} catch (error) {
  fs.mkdirSync(tempPath);
  fs.mkdirSync(serverStaticPath);
}
(() => {
  if (process.platform === "darwin") {
    return;
  }
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json({ limit: "5mb" }));
  app.use(cors());
  app.use(config.static, express.static(tempPath)); // 存放临时文件
  app.use(config.server, express.static(serverStaticPath)); // 存放前端打包页面

  app.use("/iPhone-sync", iPhoneRouter);

  app.listen(config.port);
})();
