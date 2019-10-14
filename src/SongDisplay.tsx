import React, { useState } from 'react';

const SongDisplay = ({ socket }: {socket: SocketIOClient.Socket}) => {
  const initialSate: SpotifyApi.TrackObjectFull[] = []
  const [songs, setSongs] = useState(() => initialSate);

  socket.on('emit songs', (data: SpotifyApi.TrackObjectFull[]) => {
    setSongs(data);
  })
  return (
    <div>
      {songs.map(song => (
        <div>
          <a href={song.external_urls.spotify}>
            <img src={song.album.images[1].url} alt="album art"></img>
          </a>
          <div key={song.id}>{song.name}: {song.artists[0].name}</div>
        </div>
      ))}
    </div>
  )
}

export default SongDisplay;