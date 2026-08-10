import { useState } from "react";
import "./App.css";
import LiveMode from "./src/LiveMode";
type Section = {
  id: number;
  name: string;
  type: string;
  duration: number;
};

type Song = {
  id: number;
  name: string;
  artist: string;
  genre: string;
  musical_key: string;
  tempo: number;
  yamaha_style: string;
  notes: string;
  sections: Section[];
};

const initialSongs: Song[] = [
  {
    sections: [
      {
        id: 1,
        name: "Intro",
        type: "intro",
        duration: 20,
      },
      {
        id: 2,
        name: "Main Groove",
        type: "main",
        duration: 300,
      },
      {
        id: 3,
        name: "Eulogy",
        type: "eulogy",
        duration: 180,
      },
      {
        id: 4,
        name: "Bridge",
        type: "bridge",
        duration: 120,
      },
      {
        id: 5,
        name: "Outro",
        type: "outro",
        duration: 60,
      },
    ],
    id: 1,
    name: "Ade Ori Okin",
    artist: "Traditional",
    genre: "Owambe",
    musical_key: "G",
    tempo: 102,
    yamaha_style: "Tungba",
    notes: "Main performance song",
  },
];

function App() {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [showForm, setShowForm] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [form, setForm] = useState({
    name: "",
    artist: "",
    genre: "",
    musical_key: "C",
    tempo: 100,
    yamaha_style: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "tempo" ? Number(value) : value,
    }));
  };

  const addSong = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter a song name.");
      return;
    }

    const newSong: Song = {
      id: Date.now(),
      ...form,
      sections: [],
    };

    setSongs((previous) => [...previous, newSong]);

    setForm({
      name: "",
      artist: "",
      genre: "",
      musical_key: "C",
      tempo: 100,
      yamaha_style: "",
      notes: "",
    });

    setShowForm(false);
  };

  const deleteSong = (id: number) => {
    setSongs((previous) => previous.filter((song) => song.id !== id));
  };
  if (selectedSong) {
    return (
      <LiveMode song={selectedSong} onBack={() => setSelectedSong(null)} />
    );
  }
  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>🎵 Idan Live</h1>
          <p>One-Man Band Performance System</p>
        </div>

        <button className="add-button" onClick={() => setShowForm(true)}>
          + Add Song
        </button>
      </header>

      <main>
        <section className="welcome">
          <div>
            <h2>Song Library</h2>
            <p>Prepare your songs, grooves and performance sections.</p>
          </div>

          <div className="song-count">
            <strong>{songs.length}</strong>
            <span>Songs</span>
          </div>
        </section>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <div>
                  <h2>Add Song</h2>
                  <p>Add a song to your performance library.</p>
                </div>

                <button
                  className="close-button"
                  onClick={() => setShowForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={addSong}>
                <div className="form-grid">
                  <label>
                    Song Name
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Ade Ori Okin"
                    />
                  </label>

                  <label>
                    Artist
                    <input
                      name="artist"
                      value={form.artist}
                      onChange={handleChange}
                      placeholder="Artist / Traditional"
                    />
                  </label>

                  <label>
                    Genre
                    <input
                      name="genre"
                      value={form.genre}
                      onChange={handleChange}
                      placeholder="e.g. Owambe"
                    />
                  </label>

                  <label>
                    Musical Key
                    <select
                      name="musical_key"
                      value={form.musical_key}
                      onChange={handleChange}
                    >
                      <option>C</option>
                      <option>C#</option>
                      <option>D</option>
                      <option>D#</option>
                      <option>E</option>
                      <option>F</option>
                      <option>F#</option>
                      <option>G</option>
                      <option>G#</option>
                      <option>A</option>
                      <option>A#</option>
                      <option>B</option>
                    </select>
                  </label>

                  <label>
                    Tempo (BPM)
                    <input
                      type="number"
                      name="tempo"
                      min="40"
                      max="240"
                      value={form.tempo}
                      onChange={handleChange}
                    />
                  </label>

                  <label>
                    Yamaha Style
                    <input
                      name="yamaha_style"
                      value={form.yamaha_style}
                      onChange={handleChange}
                      placeholder="e.g. Tungba"
                    />
                  </label>
                </div>

                <label>
                  Notes
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Performance notes..."
                    rows={3}
                  />
                </label>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="save-button">
                    Save Song
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section className="songs">
          {songs.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🎵</div>
              <h3>No songs yet</h3>
              <p>Add your first song to start building your live set.</p>

              <button className="add-button" onClick={() => setShowForm(true)}>
                + Add Your First Song
              </button>
            </div>
          ) : (
            <div className="song-grid">
              {songs.map((song) => (
                <article className="song-card" key={song.id}>
                  <div className="song-card-top">
                    <div className="song-icon">🎵</div>

                    <button
                      className="delete-button"
                      onClick={() => deleteSong(song.id)}
                    >
                      ×
                    </button>
                  </div>
                  <h3>{song.name}</h3>
                  <p className="artist">{song.artist || "Unknown Artist"}</p>
                  <div className="song-details">
                    <div>
                      <span>KEY</span>
                      <strong>{song.musical_key}</strong>
                    </div>

                    <div>
                      <span>BPM</span>
                      <strong>{song.tempo}</strong>
                    </div>

                    <div>
                      <span>STYLE</span>
                      <strong>{song.yamaha_style || "—"}</strong>
                    </div>
                  </div>
                  <button
                    className="live-button"
                    onClick={() => setSelectedSong(song)}
                  >
                    Open Live Mode →
                  </button>{" "}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
