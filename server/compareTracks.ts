import { 
  acousticnessDifference, 
  danceabilityDifference, 
  energyDifference, 
  instrumentalnessDifference,
  livenessDifference,
  loudnessDifference,
  speechinessDifference,
  tempoDifference,
  valenceDifference,
  durationMsDifference,
  modeDifference,
  keyDifference,
  timeSignatureDifference
} from "./audioFeatures";
import AudioFeatures = SpotifyApi.AudioFeaturesObject;

export type TrackAndDelta = [number, AudioFeatures];
type DeltaFunction = (targetTrack: AudioFeatures, recommendedTrack: AudioFeatures) => number;

const sumTrackDifference = (targetTrack: AudioFeatures, recommendedTrack: AudioFeatures) => { 
  return (delta: number, deltaFunc: DeltaFunction) => {
    return Math.pow(deltaFunc(targetTrack, recommendedTrack), 2) + delta;
  }
}

const getTrackDifference = (targetTrack: AudioFeatures) => { 
  return (recommendedTrack: AudioFeatures): TrackAndDelta => {
    const computedTrackDifference = [
      acousticnessDifference,
      danceabilityDifference,
      energyDifference,
      instrumentalnessDifference,
      // livenessDifference,
      // loudnessDifference,
      // speechinessDifference,
      tempoDifference,
      valenceDifference,
      // durationMsDifference,
      modeDifference,
      keyDifference,
      timeSignatureDifference
    ]
    .reduce(sumTrackDifference(targetTrack, recommendedTrack), 0);
    return [Math.sqrt(computedTrackDifference), recommendedTrack];
  };
};

  
const selecteNextTrack = (exploredNodes: Map<string, number>) => (selectedTrack: TrackAndDelta, currentTrack: TrackAndDelta) => {
  if(selectedTrack[1] !== null) return selectedTrack;
  if(!exploredNodes.has(currentTrack[1].id)){
    exploredNodes.set(currentTrack[1].id, currentTrack[0]);
    return currentTrack;
  }
  return selectedTrack;
}

const sortByTrackDeltas = ([aDelta]: TrackAndDelta, [bDelta]: TrackAndDelta) =>{
  return aDelta - bDelta;
}
  
export const getNextTrackOnPath = (targetTrack: AudioFeatures, exploredNodes: Map<string, number>) => {
  return (recommendations: AudioFeatures[]) => {
    return recommendations.map(getTrackDifference(targetTrack))
      .sort(sortByTrackDeltas)
      .reduce(selecteNextTrack(exploredNodes), [0, null as unknown as AudioFeatures]);
    };
}
