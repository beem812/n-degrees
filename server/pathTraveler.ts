import { SpotifyService } from './spotifyService';
import { TrackAndDelta, getNextTrackOnPath } from './compareTracks';
import AudioFeatures = SpotifyApi.AudioFeaturesObject;
interface Response<T> {
  body: T;
  headers: Record<string, string>;
  statusCode: number;
}

export class PathDriver {
  private spotifyApi: SpotifyService;
  constructor(spotifyApi: SpotifyService){
    this.spotifyApi = spotifyApi;
  }

  async travelPath(startingTrack: string, targetTrack: string, socket: SocketIO.Socket) {
    const exploredNodes = new Map<string, number>();
    const recommendedTrackWindow = this.buildRecommendedTrackWindow<TrackAndDelta>();

    const [startingId, targetId] = await this.searchTracksAndGetIds(startingTrack, targetTrack)
      .catch(this.logAndRethrow);

    const [targetTrackFeatures] = await this.spotifyApi.getAudioFeatures([targetId])
      .catch(this.logAndRethrow);

    let nextTrack = [10, {id: startingId}] as TrackAndDelta;
    let continueLoop = true;

    socket.on('cancel search', () => {
      continueLoop = false;
    });

    socket.on('disconnect', () => {
      continueLoop = false;
    })

    while(continueLoop){
      recommendedTrackWindow.sort(([deltaA],[deltaB]) => deltaB - deltaA)
      recommendedTrackWindow.push(nextTrack);
      const windowIds = recommendedTrackWindow.map((track) => track[1].id);

      const recommendationIds = 
        await this.spotifyApi.getRecommendations([...windowIds, startingId, targetId], targetTrackFeatures)
          .then(this.getRecommendationIds)
          .catch(this.logAndRethrow);

      if(recommendationIds.includes(targetId) || nextTrack[1].id === targetId || nextTrack[0] === 0){
        this.logSuccess(recommendationIds, targetId);
        const trackData = await this.spotifyApi.getTracks(Array.from(exploredNodes).map(([key, value]) => key));
        socket.emit('emit songs', trackData);
        return;
      }

      nextTrack = await this.spotifyApi.getAudioFeatures(recommendationIds)
        .then(getNextTrackOnPath(targetTrackFeatures, exploredNodes))
        //.then(this.emitNextSong(socket))
        .catch((err: Error) => {
          console.log('Err: ', err, ' paths exhausted without reaching the target');
          continueLoop = false;
          return [-1, {id: ""} as AudioFeatures] as TrackAndDelta;
        });

      console.log(exploredNodes.size)
      console.log("nextTrack delta: ", nextTrack[0]);
    }
  }

  private getRecommendationIds({body:{tracks: recommendations}}: {body:{tracks: SpotifyApi.TrackObjectSimplified[]}}){
    return recommendations.map(track => track.id)
  }

  private async searchTracksAndGetIds(startingSong: string, targetSong: string){
    const extractTrackIds = ([startingResponse, targetResponse]: [Response<SpotifyApi.SearchResponse>, Response<SpotifyApi.SearchResponse>]) => {
      const startingTrackId = startingResponse.body.tracks!.items[0].id;
      const targetTrackId = targetResponse.body.tracks!.items[0].id;
      return [startingTrackId, targetTrackId];
    }
    
    return Promise.all([this.spotifyApi.searchTrack(startingSong), this.spotifyApi.searchTrack(targetSong)])
      .then(extractTrackIds)
  }

  private buildRecommendedTrackWindow<T>(){
    const recommendedTrackWindow: T[] = []
    recommendedTrackWindow.push = function (){
      if (this.length >= 3) {
          this.shift();
      }
      return Array.prototype.push.apply(this, [...arguments]);
    } 
    return recommendedTrackWindow;
  }

  private emitNextSong(socket: SocketIO.Socket) {
    return ([number, track]: TrackAndDelta) => {
      socket.emit('emit song', {newSong:{id: track.id}});
      return [number, track] as TrackAndDelta;
    }
  }

  private logSuccess(recommendationIds: string[], targetId: string){
    console.log("############# we got em #############");
    console.log(recommendationIds.find(id => targetId === id));
  }

  private logAndRethrow(err: Error): never {
    console.log(err);
    throw err;
  }
}
