import express from 'express';
import fs from 'node:fs';
import bodyParser from 'body-parser';
import cors from 'cors';
import { join } from "node:path";
import iPhoneRouter from '../api/iPhone';
import { root, tempPath } from './constant';

export const config = {
    port: 5010,
    static: '/assets'
}

try {
    fs.accessSync(tempPath);
} catch (error) {
    fs.mkdirSync(tempPath);
}
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(cors());
app.use(config.static, express.static(join(root, '.temp')));

app.use('/iPhone-sync', iPhoneRouter);

app.listen(config.port);