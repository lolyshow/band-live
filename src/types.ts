export type AudioLayer = {
  id: string;
  name: string;
  file: string;
  volume: number;
  enabled: boolean;
};

export type Section = {
  id: string;
  name: string;
  type: string;
  bpm: number;
  duration: number; // required
  layers: AudioLayer[];
};

// export type Song = {
//   id: number;
//   name: string;
//   artist: string;
//   genre: string;
//   musical_key: string;
//   // tempo: number;
//   // yamaha_style: string;
//   notes: string;
//   sections: Section[];
// };
export type Song = {
  id: number;
  name: string;
  artist: string;
  genre: string;
  musical_key: string;
  bpm: number;
  yamaha_style: string;
  notes?: string;
  sections: Section[];
};