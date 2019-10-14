import React, { useState, useEffect, FormEvent } from 'react';
import openSocket from 'socket.io-client';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'

import { SocketMessages } from './socketMessages';
import SongDisplay from './SongDisplay';
import logo from './logo.svg';
import './App.css';

const socket = openSocket('http://localhost:3011');

const App: React.FC = () => {
  const [searchingForSongs, setSearching] = useState(false);
  const [targetTrack, setTargetTrack] = useState('');
  const [startingTrack, setStartingTrack] = useState('');

  useEffect(() => {
    socket.on(SocketMessages.startingSearch, () => {
      setSearching(true);
    });

    socket.on(SocketMessages.endingSearch, () => {
      setSearching(false);
    })
    return () => {
      console.log("unloading")
      socket.emit(SocketMessages.cancelSearch);
    }
  });

  const handleChangeTargetTrack = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTargetTrack(event.target.value);
  }

  const handleChangeStartingTrack = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartingTrack(event.target.value);
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    !searchingForSongs && socket.emit(SocketMessages.startSearch, { startingTrack, targetTrack });
  }

  const handleCancelSearch = () => {
    searchingForSongs && socket.emit(SocketMessages.cancelSearch);
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Enter two tracks to see related track recommendations
        </p>
       
      </header>
      <div>
        <h2>Search Status: {searchingForSongs ? "Searching" : "Waiting To Search"}</h2>
        <form onSubmit={handleSubmit}>
          <InputGroup className="App-form-row">
            <InputGroup.Prepend>
              <InputGroup.Text className="App-input-label" id="basic-addon1">Starting Track</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
              onChange={handleChangeStartingTrack}
              className="App-input"
              placeholder="Enter A Track Name"
              aria-label="Starting Track"
              aria-describedby="basic-addon1"
            />
          </InputGroup>
          <InputGroup className="App-form-row">
            <InputGroup.Prepend className="prepend">
              <InputGroup.Text className="App-input-label" id="basic-addon1">Target Track</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
              onChange={handleChangeTargetTrack}
              className="App-input"
              placeholder="Enter A Track Name"
              aria-label="Starting Track"
              aria-describedby="basic-addon1"
            />
          </InputGroup>
          <div className="App-form-row">
            <div className="App-form-column">
              <div className="flex-end">
                <Button className="button" type="submit" variant="primary">Search For Songs</Button>
              </div>
            </div>
            <div className="App-form-column">
              <div className="flex-start">
                <Button className="button" onClick={handleCancelSearch}>Cancel Search</Button>
              </div>
            </div>
          </div>
        </form>
        <SongDisplay socket={socket}/>
      </div>
    </div>
  );
}

export default App;
