import isDev from 'electron-is-dev';
import dayjs from 'dayjs';

export default function logger(content: string) {
    if (isDev) {
        console.log(content);
    } else {
        
    }
}