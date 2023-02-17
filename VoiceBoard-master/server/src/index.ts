import express from 'express';
import { createServer } from 'http';
import SocketIO from 'socket.io';

const app = express();
const server = createServer(app);
const io = SocketIO(server);
const port = 3000;

server.listen(port);

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/action', (req: express.Request, res: express.Response) => {
  if (req.query.type === undefined) {
    res.status(400).send("error: missing parameter 'type'");
    return;
  }
  const type = req.query.type as string;
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

app.get('/mode', (req: express.Request, res: express.Response) => {
  if (req.query.type === undefined) {
    res.status(400).send("error: missing parameter 'type'");
    return;
  }
  const type = req.query.type as string;
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

app.get('/draw', (req: express.Request, res: express.Response) => {
  if (req.query.type === undefined) {
    res.status(400).send("error: missing parameter 'type'");
    return;
  }
  if (req.query.value === undefined) {
    res.status(400).send("error: missing parameter 'value'");
    return;
  }
  const type = (req.query.type as string).toUpperCase();
  const value = (req.query.value as string).toUpperCase();

  if (type === 'SHAPE') {
    const validShapes = [ 'RECTANGLE', 'OVAL', 'CIRCLE' ];
    if (!validShapes.includes(value)) {
      res.status(400).send("error: incorrect parameter 'value'");
      return;
    }
  } else if (type !== 'CLASS' && type !== 'TEXT') {
    res.status(400).send("error: incorrect parameter 'type'");
    return;
  }

  io.emit('draw', { type, value });
  res.status(200).send('ok');
  return;
});

app.get('/connect', (req: express.Request, res: express.Response) => {
  if (req.query.a === undefined || req.query.b === undefined) {
    res.status(400).send('error: missing parameter');
    return;
  }
  const a = (req.query.a as string).toUpperCase();
  const b = (req.query.b as string).toUpperCase();

  io.emit('action:connect', { a, b });
  res.status(200).send('ok');
  return;
});

io.on('connection', (socket) => {
  console.log('client connected');
  socket.emit('connection:success');
});
