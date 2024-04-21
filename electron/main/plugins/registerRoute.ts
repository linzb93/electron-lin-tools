import { createIpcRoute } from "./electron-ipc-route";

const ipcRoute = createIpcRoute('api2');

ipcRoute.on('copy', () => {})