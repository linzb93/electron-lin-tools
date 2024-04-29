import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import sharp from "sharp";
import pMap from "p-map";
import { Request } from "../types/api";
// import { HTTP_STATUS } from "../plugins/constant";

export default class extends Controller {
  @Route("compress-start")
  async start(req: Request) {
    const { list } = req.params;
    await pMap(
      list,
      (picture) =>
        new Promise((resolve) => {
          sharp(picture)
            .resize()
            .toFile("", (err, info) => {
              resolve(null);
            });
        }),
      { concurrency: 4 }
    );
  }
  @Route("compress-save")
  async save(req: Request) {}
}
