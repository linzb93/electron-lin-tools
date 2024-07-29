import fs from "node:fs";
import isDev from "electron-is-dev";
import dayjs from "dayjs";
import { join } from "node:path";
import { root } from "./constant";

export default function logger(content: string) {
  if (isDev) {
    console.log(content);
  } else {
    fs.appendFile(
      join(root, "error.log"),
      `[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] ${content}\n`,
      () => {}
    );
  }
}
