import { useEffect, useState, useRef } from "react";

type Section = {
  id: number;
  name: string;
  type: string;
  duration: number;
};

type Song = {
  name: string;
  artist: string;
  musical_key: string;
  tempo: number;
  yamaha_style: string;
  sections: Section[];
};

type Props = {
  song: Song;
  onBack: () => void;
};

type AudioLayer = {
  id: string;
  name: string;
  file: string;
  volume: number;
  enabled: boolean;
};

function LiveMode({ song, onBack }: Props) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSection, setCurrentSection] = useState<Section | null>(
    song.sections[0] || null,
  );

  const audioFiles: Record<string, string> = {
    intro: "/audio/ade-ori-okin/intro.mp3",
    main: "/audio/ade-ori-okin/main.mp3",
    eulogy: "/audio/ade-ori-okin/eulogy.mp3",
    bridge: "/audio/ade-ori-okin/bridge.mp3",
    outro: "/audio/ade-ori-okin/outro.mp3",
  };

  const [layers, setLayers] = useState<AudioLayer[]>([
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
  ]);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(() => {
      setElapsed((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [playing]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${remaining
      .toString()
      .padStart(2, "0")}`;
  };

  const selectSection = async (section: Section) => {
    setCurrentSection(section);
    setElapsed(0);

    // Get the audio layers for the section we clicked
    const newLayers = getLayersForSection(section.type);

    // Stop the currently playing layers
    Object.values(audioRefs.current).forEach((audio) => {
      if (!audio) return;

      audio.pause();
      audio.currentTime = 0;
    });

    // Update the layers
    setLayers(newLayers);

    // If we weren't playing, don't automatically start
    if (!playing) return;

    // Give React a moment to render the new audio elements
    setTimeout(async () => {
      const newAudioPlayers = Object.values(audioRefs.current).filter(
        (audio): audio is HTMLAudioElement => audio !== null,
      );

      try {
        await Promise.all(
          newAudioPlayers.map((audio) => {
            audio.volume = 1;
            return audio.play();
          }),
        );
      } catch (error) {
        console.error("Unable to switch section:", error);
      }
    }, 100);
  };

  const stop = () => {
    Object.values(audioRefs.current).forEach((audio) => {
      if (!audio) return;

      audio.pause();
      audio.currentTime = 0;
    });

    setPlaying(false);
    setElapsed(0);
  };

  const togglePlay = async () => {
    const audioPlayers = Object.values(audioRefs.current).filter(
      (audio): audio is HTMLAudioElement => audio !== null,
    );

    if (playing) {
      audioPlayers.forEach((audio) => {
        audio.pause();
      });

      setPlaying(false);
      return;
    }

    try {
      await Promise.all(audioPlayers.map((audio) => audio.play()));

      setPlaying(true);
    } catch (error) {
      console.error("Unable to start audio layers:", error);
    }
  };

  const getLayersForSection = (sectionType: string): AudioLayer[] => {
    switch (sectionType) {
      case "main":
        return [
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
        ];

      case "eulogy":
        return [
          {
            id: "guitar",
            name: "Guitar",
            file: "/audio/ade-ori-okin/eulogy/guitar.mp3",
            volume: 1,
            enabled: true,
          },
        ];

      default:
        return [];
    }
  };

  return (
    <div className="live-mode">
      <audio ref={audioRef} loop />{" "}
      <div className="audio-layers">
        {layers.map((layer) => (
          <audio
            key={layer.id}
            ref={(element) => {
              audioRefs.current[layer.id] = element;
            }}
            src={layer.file}
            loop
          />
        ))}
      </div>
      <header className="live-header">
        <button className="back-button" onClick={onBack}>
          ← Songs
        </button>

        <div className="live-song">
          <h1>{song.name}</h1>
          <span>{song.artist}</span>
        </div>

        <div className="live-bpm">{song.tempo} BPM</div>
      </header>
      <main className="performance">
        <div className="status">
          <span className={playing ? "status-dot playing" : "status-dot"} />

          {playing ? "PLAYING" : "STOPPED"}
        </div>

        <div className="timer">{formatTime(elapsed)}</div>

        <div className="transport">
          <button onClick={() => setElapsed(0)}>↺</button>

          <button className="stop-button" onClick={stop}>
            ■
          </button>

          <button className="play-button" onClick={togglePlay}>
            {playing ? "Ⅱ" : "▶"}
          </button>
        </div>

        <section className="section-panel">
          <div className="section-heading">
            <h2>Performance Sections</h2>

            <span>{currentSection?.name || "No section selected"}</span>
          </div>

          <div className="section-buttons">
            {song.sections.map((section) => (
              <button
                key={section.id}
                className={
                  currentSection?.id === section.id
                    ? "section active"
                    : "section"
                }
                onClick={() => selectSection(section)}
              >
                {section.name}
              </button>
            ))}
          </div>
        </section>

        <section className="layers-panel">
          <h2>Instrument Layers</h2>

          {layers.map((layer) => (
            <div key={layer.id} className="layer-row">
              <button
                onClick={() => {
                  const newEnabled = !layer.enabled;

                  setLayers((previous) =>
                    previous.map((item) =>
                      item.id === layer.id
                        ? {
                            ...item,
                            enabled: newEnabled,
                          }
                        : item,
                    ),
                  );

                  const audio = audioRefs.current[layer.id];

                  if (audio) {
                    audio.muted = !newEnabled;
                  }
                }}
              >
                {layer.enabled ? "🔊" : "🔇"}
              </button>

              <span>{layer.name}</span>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={layer.volume}
                onChange={(event) => {
                  const volume = Number(event.target.value);

                  setLayers((previous) =>
                    previous.map((item) =>
                      item.id === layer.id
                        ? {
                            ...item,
                            volume,
                          }
                        : item,
                    ),
                  );

                  const audio = audioRefs.current[layer.id];

                  if (audio) {
                    audio.volume = volume;
                  }
                }}
              />
            </div>
          ))}
        </section>

        <section className="performance-info">
          <div>
            <span>KEY</span>
            <strong>{song.musical_key}</strong>
          </div>

          <div>
            <span>BPM</span>
            <strong>{song.tempo}</strong>
          </div>

          <div>
            <span>YAMAHA STYLE</span>
            <strong>{song.yamaha_style || "—"}</strong>
          </div>

          <div>
            <span>SECTION</span>
            <strong>{currentSection?.name || "—"}</strong>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LiveMode;
