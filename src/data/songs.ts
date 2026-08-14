import { Song } from "../types";

export const songs: Song[] = [
  {
    id: 1,
    name: "Ade Ori Okin",
    artist: "Idan Vibes",
    genre: "Afrobeats",
    musical_key: "C",
    bpm: 100,
    yamaha_style: "Tungba",
    notes: "Main performance song",

    sections: [
      {
        id: "main",
        name: "Main Groove",
        type: "main",
        bpm: 100,
        duration: 20,

        layers: [
          {
            id: "guitar",
            name: "Guitar",
            file: "/audio/ade-ori-okin/main/guitar.mp3",
            volume: 1,
            enabled: true,
          },
          {
            id: "talking-drum",
            name: "Talking Drum",
            file: "/audio/ade-ori-okin/main/talking-drum.mp3",
            volume: 1,
            enabled: true,
          },
        ],
      },

      {
        id: "eulogy",
        name: "Eulogy",
        type: "eulogy",
        bpm: 90,
        duration: 20,

        layers: [
          {
            id: "guitar",
            name: "Guitar",
            file: "/audio/ade-ori-okin/eulogy/guitar.mp3",
            volume: 1,
            enabled: true,
          },
        ],
      },
      {
        id: "eulogy2",
        name: "Eulogy2",
        type: "eulogy2",
        bpm: 90,
        duration: 20,

        layers: [
          {
            id: "guitar",
            name: "Guitar",
            file: "/audio/ade-ori-okin/eulogy/guitar.mp3",
            volume: 1,
            enabled: true,
          },
        ],
      },
    ],
  },
];
