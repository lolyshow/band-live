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

    const audio = audioRef.current;

    if (!audio) return;

    const source = audioFiles[section.type];

    if (!source) return;

    const wasPlaying = !audio.paused;

    audio.pause();

    audio.src = source;
    audio.load();

    if (wasPlaying) {
      try {
        await audio.play();
        setPlaying(true);
      } catch (error) {
        console.error("Unable to play audio:", error);
        setPlaying(false);
      }
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setPlaying(false);
    setElapsed(0);
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      await audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="live-mode">
      <audio ref={audioRef} loop />{" "}
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
