const isWin = process.platform === 'win32';

export default {
    basename(path:string) {
        return path.split(isWin ? '\\' : '/').at(-1)
    }
}