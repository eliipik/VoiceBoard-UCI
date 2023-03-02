"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = __importDefault(require("socket.io"));
const app = express_1.default();
const server = http_1.createServer(app);
const io = socket_io_1.default(server);
const port = 3000;
server.listen(port);
app.get('/', (req, res) => res.send('Hello World!'));
app.get('/action', (req, res) => {
    if (req.query.type === undefined) {
        res.status(400).send("error: missing parameter 'type'");
        return;
    }
    const type = req.query.type;
    switch (type) {
        case 'undo': {
            io.emit('action:undo');
            break;
        }
        case 'redo': {
            io.emit('action:redo');
            break;
        }
        case 'clear': {
            io.emit('action:clear');
            break;
        }
        default: {
            res.status(400).send("error: incorrect parameter 'type'");
            return;
        }
    }
    res.status(200).send('ok');
    return;
});
app.get('/mode', (req, res) => {
    if (req.query.type === undefined) {
        res.status(400).send("error: missing parameter 'type'");
        return;
    }
    const type = req.query.type;
    switch (type) {
        case 'none': {
            io.emit('tool:none');
            break;
        }
        case 'pen': {
            io.emit('tool:pen');
            break;
        }
        case 'rect': {
            io.emit('tool:rect');
            break;
        }
        case 'oval': {
            io.emit('tool:oval');
            break;
        }
        default: {
            res.status(400).send("error: incorrect parameter 'type'");
            return;
        }
    }
    res.status(200).send('ok');
    return;
});
app.get('/draw', (req, res) => {
    if (req.query.type === undefined) {
        res.status(400).send("error: missing parameter 'type'");
        return;
    }
    if (req.query.value === undefined) {
        res.status(400).send("error: missing parameter 'value'");
        return;
    }
    const type = req.query.type.toUpperCase();
    const value = req.query.value.toUpperCase();
    if (type === 'SHAPE') {
        const validShapes = ['RECTANGLE', 'OVAL', 'CIRCLE'];
        if (!validShapes.includes(value)) {
            res.status(400).send("error: incorrect parameter 'value'");
            return;
        }
    }
    else if (type !== 'CLASS' && type !== 'TEXT') {
        res.status(400).send("error: incorrect parameter 'type'");
        return;
    }
    io.emit('draw', { type, value });
    res.status(200).send('ok');
    return;
});
app.get('/connect', (req, res) => {
    if (req.query.a === undefined || req.query.b === undefined) {
        res.status(400).send('error: missing parameter');
        return;
    }
    const a = req.query.a.toUpperCase();
    const b = req.query.b.toUpperCase();
    io.emit('action:connect', { a, b });
    res.status(200).send('ok');
    return;
});
io.on('connection', (socket) => {
    console.log('client connected');
    socket.emit('connection:success');
});
//# sourceMappingURL=index.js.map