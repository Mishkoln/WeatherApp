import { StaticServer } from './StaticServer';

const hostname: string = '127.0.0.1';
const port: number = 8080;

const staticServer = new StaticServer();
staticServer.listen(port, hostname);