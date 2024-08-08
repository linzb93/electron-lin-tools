import fs from "node:fs";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import iPhoneRouter from "../api/iPhone";
import { tempPath } from "./constant";

export const config = {
  port: 5010,
  static: "/assets",
  server: "/pages",
};

try {
  fs.accessSync(tempPath);
} catch (error) {
  fs.mkdirSync(tempPath);
}
(() => {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json({ limit: "5mb" }));
  app.use(cors());
  app.use(config.static, express.static(tempPath)); // 存放临时文件
  app.use("/iPhone-sync", iPhoneRouter);

  app.listen(config.port);
})();
