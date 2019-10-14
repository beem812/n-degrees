import { createServer } from 'http';
import express from 'express';
import socket from 'socket.io';
import { PathDriver } from './pathTraveler';
import { SpotifyService } from './spotifyService';
import { searchPayload } from '../shared/socketTypes';
import { SocketMessages } from '../src/socketMessages';

const app = express();
const server = createServer(app);
const io = socket(server);

const port = 3011;

const spotifyService = new SpotifyService();
const pathTraveler = new PathDriver(spotifyService);

io.on('connection', async socket => {
  await spotifyService.initialize();
  console.log('a user connected');

  socket.on(SocketMessages.disconnect, reason => {
    console.log('user disconnected');
    // socket.disconnect();
  });

  socket.on(SocketMessages.startSearch, async (data: searchPayload) => {
    console.log('starting search');
    socket.emit(SocketMessages.startingSearch);
    const startingTrack = data.startingTrack;
    const targetTrack = data.targetTrack;
    await pathTraveler.travelPath(startingTrack, targetTrack, socket)
      .catch(() => socket.emit(SocketMessages.endingSearch));
    socket.emit(SocketMessages.endingSearch);
  })
});

server.listen(port);

console.log('Listening on port: ', port);
export default server;