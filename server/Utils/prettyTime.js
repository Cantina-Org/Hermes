export function prettyTime(timecode) {
    const time = new Date(timecode);

    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    const day = time.getDay().toString().padStart(2, '0');
    const month = time.getMonth().toString().padStart(2, '0');
    const year = time.getFullYear().toString().padStart(2, '0');

    return day+'/'+month+'/'+year+' '+hours+':'+minutes+':'+seconds;
}

