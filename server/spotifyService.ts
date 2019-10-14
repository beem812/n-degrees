import SpotifyWebApi from 'spotify-web-api-node';

interface Response<T> {
  body: T;
  headers: Record<string, string>;
  statusCode: number;
}

export class SpotifyService {
  private spotifyApi: SpotifyWebApi;

  constructor(){
    this.spotifyApi = new SpotifyWebApi({
      clientId: 'c9d2daa92f7749bc90e858c66155ff02',
      clientSecret: '2cb3c93755184cefba6d42b6bb7bc8d9',
    }); 
  }

  async initialize() {
    console.log("initializing")
    if(this.spotifyApi.getAccessToken()){
      return;
    }
    return this.spotifyApi.clientCredentialsGrant()
      .then(({body: {'access_token': token}}) => {
        console.log('Successfully retrieved access token', token);
        this.spotifyApi.setAccessToken(token);
      })
      .catch(err => console.log('Authentication failed with error: ', err));
  }

  async searchTrack(trackName: string){
    return this.spotifyApi.searchTracks(`track:${trackName}`);
  }

  async getTracks(trackIds: string[]){
    const {body: { tracks }} = await this.spotifyApi.getTracks(trackIds);
    return tracks;
  }

  async searchTracksAndGetIds(startingSong: string, targetSong: string){
    const extractTrackIds = ([startingResponse, targetResponse]: [Response<SpotifyApi.SearchResponse>, Response<SpotifyApi.SearchResponse>]) => {
      const startingTrackId = startingResponse.body.tracks!.items[0].id;
      const targetTrackId = targetResponse.body.tracks!.items[0].id;
      return [startingTrackId, targetTrackId];
    }
    
    return Promise.all([this.searchTrack(startingSong), this.searchTrack(targetSong)])
      .then(extractTrackIds)
  }

  async getRecommendations(trackIds: string[], targetTrackFeatures: SpotifyApi.AudioFeaturesObject){
    return this.spotifyApi.getRecommendations({
        limit: 99, 
        seed_tracks: trackIds,
        // target_acousticness: targetTrackFeatures.acousticness,
        // target_danceability: targetTrackFeatures.danceability,
        // target_energy: targetTrackFeatures.energy,
        // target_instrumentalness: targetTrackFeatures.instrumentalness,
        // target_key: targetTrackFeatures.key,
        // // target_liveness: targetTrackFeatures.liveness,
        // // target_loudness: targetTrackFeatures.loudness,
        // target_mode: targetTrackFeatures.mode,
        // target_tempo: targetTrackFeatures.tempo,
        // // target_speechiness: targetTrackFeatures.speechiness,
        // target_time_signature: targetTrackFeatures.time_signature

      });
  }

  async getAudioFeatures(tracksIds: string[]){
    return this.spotifyApi.getAudioFeaturesForTracks(tracksIds)
      .then(({body: { audio_features }}) => audio_features);
  }
}
