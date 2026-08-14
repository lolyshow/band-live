import { useEffect, useState, useRef } from "react";
import type { Song, Section, AudioLayer } from "./types";
import { AudioEngine } from "./audio/AudioEngine";
import "./LiveMode.css";
type Props = {
  song: Song;
  onBack: () => void;
};

function LiveMode({ song, onBack }: Props) {
  console.log("LIVE SONG:", song);
  console.log("LIVE SECTIONS:", song.sections);
  console.log("FIRST SECTION:", song.sections[0]);
  console.log("FIRST SECTION LAYERS:", song.sections[0]?.layers);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(1);
  const [currentBar, setCurrentBar] = useState(1);
  const audioEngine = useRef<AudioEngine | null>(null);
  const [currentSection, setCurrentSection] = useState<Section | null>(
    song.sections[0] || null,
  );
  const [pendingSection, setPendingSection] = useState<Section | null>(null);

  const [layers, setLayers] = useState<AudioLayer[]>(
    song.sections[0]?.layers ?? [],
  );
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  if (!audioEngine.current) {
    audioEngine.current = new AudioEngine();
  }

  useEffect(() => {
    if (!playing || !currentSection) return;

    let animationFrame: number;

    const updateClock = () => {
      const currentTime = audioEngine.current?.getCurrentTime() ?? 0;

      setElapsed(currentTime);

      const beatDuration = 60 / currentSection.bpm;

      const totalBeats = Math.floor(currentTime / beatDuration);

      const beat = (totalBeats % 4) + 1;
      const bar = Math.floor(totalBeats / 4) + 1;

      setCurrentBeat(beat);
      setCurrentBar(bar);

      animationFrame = requestAnimationFrame(updateClock);
    };

    animationFrame = requestAnimationFrame(updateClock);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [playing, currentSection]);

  useEffect(() => {
    if (!playing || !currentSection || !pendingSection) return;

    // We only switch when the current bar has finished.
    if (currentBeat !== 4) return;

    const beatDuration = 60 / currentSection.bpm;
    const currentTime = audioEngine.current?.getCurrentTime() ?? 0;

    const beatsInCurrentBar = Math.floor(currentTime / beatDuration) % 4;

    // Wait until beat 4 has actually completed
    if (beatsInCurrentBar !== 3) return;

    const nextSection = pendingSection;

    console.log("BAR TRANSITION:", currentSection.name, "→", nextSection.name);

    audioEngine.current?.stopAll();

    setElapsed(0);
    setCurrentBeat(1);
    setCurrentBar(1);

    setPendingSection(null);
    setCurrentSection(nextSection);

    audioEngine.current?.loadLayers(nextSection.layers);

    audioEngine.current
      ?.play()
      .then(() => {
        setPlaying(true);
      })
      .catch((error) => {
        console.error("TRANSITION PLAY ERROR:", error);
        setPlaying(false);
      });
  }, [currentBeat, playing, currentSection, pendingSection]);

  useEffect(() => {
    if (!playing || !currentSection) return;

    if (elapsed >= currentSection.duration) {
      moveToNextSection();
    }
  }, [elapsed, playing, currentSection]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${remaining
      .toString()
      .padStart(2, "0")}`;
  };

  const selectSection = (section: Section) => {
    if (!currentSection) return;

    // If we're stopped, switch immediately
    if (!playing) {
      setCurrentSection(section);
      setElapsed(0);
      setCurrentBeat(1);
      setCurrentBar(1);

      audioEngine.current?.stopAll();
      audioEngine.current?.loadLayers(section.layers);

      audioEngine.current?.play();

      setPlaying(true);
      return;
    }

    // If already playing, wait until the current bar finishes
    console.log("SECTION QUEUED:", currentSection.name, "→", section.name);

    setPendingSection(section);
  };

  const moveToNextSection = async () => {
    if (!currentSection) return;

    const currentIndex = song.sections.findIndex(
      (section) => section.id === currentSection.id,
    );

    const nextSection = song.sections[currentIndex + 1];

    if (!nextSection) {
      audioEngine.current?.stopAll();

      setPlaying(false);
      setElapsed(0);
      setCurrentBeat(1);
      setCurrentBar(1);

      return;
    }

    console.log("AUTO SWITCH:", currentSection.name, "→", nextSection.name);

    // Stop current section
    audioEngine.current?.stopAll();

    // Reset visual clock
    setElapsed(0);
    setCurrentBeat(1);
    setCurrentBar(1);

    // Change section
    setCurrentSection(nextSection);

    // Load new section
    audioEngine.current?.loadLayers(nextSection.layers);

    try {
      await audioEngine.current?.play();

      setPlaying(true);

      console.log("AUTO SECTION PLAYING:", nextSection.name);
    } catch (error) {
      console.error("AUTO SECTION PLAY ERROR:", error);
      setPlaying(false);
    }
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

  const stopPlayback = () => {
    audioEngine.current?.stopAll();

    setPlaying(false);
    setElapsed(0);
    setCurrentBeat(1);
    setCurrentBar(1);
  };

  const togglePlay = async () => {
    if (!audioEngine.current || !currentSection) return;

    try {
      if (playing) {
        audioEngine.current.pause();
        setPlaying(false);
        return;
      }

      if (!audioEngine.current.hasLayers()) {
        audioEngine.current.loadLayers(currentSection.layers);
      }

      await audioEngine.current.play();

      setPlaying(true);
    } catch (error) {
      console.error("PLAY ERROR:", error);
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

        <div className="live-bpm">{song.bpm} BPM</div>
      </header>
      <main className="performance">
        <div className="status">
          <span className={playing ? "status-dot playing" : "status-dot"} />

          {playing ? "PLAYING" : "STOPPED"}
        </div>

        <div className="timer">{formatTime(elapsed)}</div>

        <div className="transport">
          <button onClick={() => setElapsed(0)}>↺</button>

          <button className="stop-button" onClick={stopPlayback}>
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

            {pendingSection && (
              <span className="pending-section">→ {pendingSection.name}</span>
            )}
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
            <strong>{song.bpm}</strong>
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

        <div className="beat-clock">
          <div className="tempo">{currentSection?.bpm ?? song.bpm} BPM</div>

          <div className="bar-info">Bar {currentBar}</div>

          <div className="beats">
            {[1, 2, 3, 4].map((beat) => (
              <span
                key={beat}
                className={beat === currentBeat ? "beat active" : "beat"}
              >
                {beat}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default LiveMode;
