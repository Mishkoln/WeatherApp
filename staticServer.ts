import * as http from 'http';
import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';
import {contentTypes, responseCodes} from "./resources";

export class StaticServer {
    private _server: http.Server;

    constructor() {
        //this.initContentTypes();
        this._server = http.createServer(this.onRequest);
    }

    listen(port: number, hostname: string): void {
        this._server.listen(port, hostname);
        console.log(`Server running at http://${hostname}:${port}/`);
    }

    private onRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
        const reqUrl: url.UrlWithStringQuery = url.parse(req.url);
        const fileName: string = reqUrl.pathname === '/' ?
            'index.html' : reqUrl.pathname.substring(1);
        const ext: string = path.extname(fileName).substring(1);
        const cType: string = contentTypes.get(ext);
        fs.readFile(fileName, function (err: any, data: string | Buffer) {
            if (err) {
                if (err.code == 'ENOENT') {
                    res.writeHead(responseCodes.NotFound, {'Content-Type': 'text/plain'});
                    res.write('Resource no found');
                } else {
                    res.writeHead(responseCodes.ServerError, {'Content-Type': 'text/plain'});
                    res.write('Server Error');
                }
            } else {
                res.writeHead(responseCodes.Success, {'Content-Type': cType});
                res.write(data);
            }
            res.end();
        });
    }
}
