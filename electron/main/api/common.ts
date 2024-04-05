import { clipboard } from 'electron';
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { HTTP_STATUS } from "../plugins/constant";

export default class extends Controller {
    @Route('copy')
    doCopy(text:string) {
        clipboard.writeText(text);
        return {
            code: HTTP_STATUS.SUCCESS,
            message: "复制成功"
        };
    }
}