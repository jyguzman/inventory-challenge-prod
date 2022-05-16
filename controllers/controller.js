const itemNotFoundError = (res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send()
}

const sendResponse = (res, statusCode, body) => {
    res.setHeader('Content-Type', 'application/json');
    const data = JSON.stringify(body, null, 4);
    res.status(statusCode).send(data);
}

module.exports = {
    sendResponse
}