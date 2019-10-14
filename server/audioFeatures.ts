
import AudioFeatures = SpotifyApi.AudioFeaturesObject;

export const acousticnessDifference = (a: AudioFeatures, b: AudioFeatures) => {
  // Float between 0.0 and 1.0
  return a.acousticness - b.acousticness;
};

export let danceabilityDifference = (a: AudioFeatures, b: AudioFeatures) => {
  // Float between 0.0 and 1.0
  return a.danceability - b.danceability;
};

export let energyDifference = (a: AudioFeatures, b: AudioFeatures) => {
  // Float between 0.0 and 1.0
  return a.energy - b.energy;
};

export let instrumentalnessDifference = (a: AudioFeatures, b: AudioFeatures) => {
  // Float between 0.0 and 1.0
  return a.instrumentalness - b.instrumentalness;
};

export let livenessDifference = (a: AudioFeatures, b: AudioFeatures) => {
  // Float between 0.0 and 1.0
  return a.liveness - b.liveness;
};

export let loudnessDifference = (a: AudioFeatures, b: AudioFeatures) => {
  // Integer? between -60 and 0;
  return (a.loudness/-60) - (b.loudness/-60);
};

export let speechinessDifference = (a: AudioFeatures, b: AudioFeatures) => {
  // Float between 0.0 and 1.0
  return a.speechiness - b.speechiness;
};

export let tempoDifference = (a: AudioFeatures, b: AudioFeatures) => {
  // BPM of the track, no given range.
  return (a.tempo/240) - (b.tempo/240);
};

export let valenceDifference = (a: AudioFeatures, b: AudioFeatures) => {
  // Float between 0.0 and 1.0
  return a.valence - b.valence;
};

export let durationMsDifference = (a: AudioFeatures, b: AudioFeatures) => {
  // Maybe not worth tracking? No range given. Guessing at 15 minutes in milliseconds
  return (a.duration_ms/900000) - (b.duration_ms/900000);
};

export let keyDifference = (a: AudioFeatures, b: AudioFeatures) => {
  // Int from 0 - 11
  return (a.key/11) - (b.key/11);
};

export let modeDifference = (a: AudioFeatures, b: AudioFeatures) => {
  // Int EITHER 0 or 1
  return a.mode - b.mode;
};

export let timeSignatureDifference = (a: AudioFeatures, b: AudioFeatures) => {
  // Integer representing the beats per bar, or the top number in a time signature ie the 3 in 3/4 time
  return (a.time_signature/12) - (b.time_signature/12);
};
