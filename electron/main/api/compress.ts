import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { HTTP_STATUS } from "../plugins/constant";

export default class extends Controller {
    @Route('compress-start')
    start() {}
}
