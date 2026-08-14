import type { AudioLayer } from "../types";

export class AudioEngine {
  private audios: Map<string, HTMLAudioElement> = new Map();

  loadLayers(layers: AudioLayer[]) {
    console.log("LOADING AUDIO LAYERS:", layers);

    this.stopAll();

    layers.forEach((layer) => {
      console.log("Loading:", layer.name, layer.file);

      const audio = new Audio(layer.file);

      audio.volume = layer.enabled ? layer.volume : 0;
      audio.preload = "auto";

      audio.addEventListener("canplaythrough", () => {
        console.log("AUDIO READY:", layer.file);
      });

      audio.addEventListener("error", () => {
        console.error("AUDIO ERROR:", layer.file, audio.error);
      });

      this.audios.set(layer.id, audio);
    });
  }

  async play() {
    console.log("PLAYING AUDIO COUNT:", this.audios.size);

    const promises = Array.from(this.audios.values()).map((audio) => {
      console.log("PLAY:", audio.src);

      return audio.play();
    });

    await Promise.all(promises);

    console.log("ALL AUDIO PLAYING");
  }

  pause() {
    this.audios.forEach((audio) => {
      audio.pause();
    });
  }

  stopAll() {
    this.audios.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    this.audios.clear();
  }

  hasLayers(): boolean {
    return this.audios.size > 0;
  }

  setVolume(id: string, volume: number) {
    const audio = this.audios.get(id);

    if (!audio) return;

    audio.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(id: string, enabled: boolean) {
    const audio = this.audios.get(id);

    if (!audio) return;

    audio.volume = enabled ? 1 : 0;
  }

  getCurrentTime(): number {
    const firstAudio = this.audios.values().next().value;

    if (!firstAudio) return 0;

    return firstAudio.currentTime;
  }
}
