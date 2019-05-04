const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

const contentTypes = new Map();
contentTypes.set('html', 'text/html');
contentTypes.set('js', 'text/javascript');
contentTypes.set('css', 'text/css');
contentTypes.set('json', 'application/json');
contentTypes.set('jpg', 'image/jpeg');
contentTypes.set('png', 'image/png');

module.exports = http.createServer(function (req, res) {
    const reqUrl = url.parse(req.url);
    const fileName = reqUrl.pathname === '/' ?
        'index.html' : reqUrl.pathname.substring(1);
    const ext = path.extname(fileName).substring(1);
    const cType = contentTypes.get(ext);
    fs.readFile(fileName, function (err, data) {
        if (err) {
            if (err.code == 'ENOENT') {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Resource no found');
            } else {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.write('Server Error');
            }
        } else {
            res.writeHead(200, {'Content-Type': cType});
            res.write(data);
        }
        res.end();
    });
});