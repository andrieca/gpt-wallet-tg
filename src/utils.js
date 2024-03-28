const pTimeoutException = Symbol();

function pTimeout(promise, time, exception = pTimeoutException) {
    let timer;
    return Promise.race([
        promise,
        new Promise((_r, rej) => (timer = setTimeout(rej, time, exception)))
    ]).finally(() => clearTimeout(timer));
}

module.exports = { pTimeout, pTimeoutException };