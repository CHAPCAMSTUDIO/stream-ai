import { useEffect, useRef, useState } from 'react';
import { Gift, Mic, MicOff, Radio, ShieldCheck, SlidersHorizontal, Volume2 } from 'lucide-react';

type VoicePreset = {
  id: string;
  name: string;
  description: string;
  pitch: number;
  rate: number;
};

const presets: VoicePreset[] = [
  { id: 'natural', name: 'Naturelle+', description: 'Voix claire pour discussion', pitch: 0, rate: 1 },
  { id: 'deep', name: 'Grave Studio', description: 'Voix profonde et chaleureuse', pitch: -7, rate: 0.92 },
  { id: 'bright', name: 'Energie Live', description: 'Voix brillante pour le streaming', pitch: 5, rate: 1.08 },
  { id: 'robot', name: 'Robot Live', description: 'Effet electronique pour le direct', pitch: -2, rate: 1 },
];

export default function App() {
  const [active, setActive] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [preset, setPreset] = useState(presets[0]);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const outputRef = useRef<GainNode | null>(null);

  async function startMicrophone() {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const context = new AudioContext();
      await context.resume();
      audioRef.current = context;

      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      const compressor = context.createDynamicsCompressor();
      const filter = context.createBiquadFilter();
      const output = context.createGain();

      analyser.fftSize = 256;
      filter.type = preset.id === 'deep' ? 'lowshelf' : 'highshelf';
      filter.frequency.value = preset.id === 'deep' ? 260 : 2600;
      filter.gain.value = preset.id === 'natural' ? 0 : preset.id === 'deep' ? 8 : 5;
      output.gain.value = monitoring ? 0.7 : 0;
      outputRef.current = output;

      source.connect(analyser);
      source.connect(filter).connect(compressor).connect(output).connect(context.destination);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const updateMeter = () => {
        analyser.getByteFrequencyData(data);
        const average = data.reduce((sum, value) => sum + value, 0) / data.length;
        setVolume(Math.min(100, Math.round(average * 1.7)));
        frameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();
      setActive(true);
    } catch {
      setError("Acces au microphone refuse. Autorisez-le dans votre navigateur.");
    }
  }

  function stopMicrophone() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    void audioRef.current?.close();
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    streamRef.current = null;
    audioRef.current = null;
    outputRef.current = null;
    setVolume(0);
    setActive(false);
  }

  function toggleMonitoring() {
    const next = !monitoring;
    setMonitoring(next);
    if (outputRef.current && audioRef.current) {
      outputRef.current.gain.setTargetAtTime(next ? 0.7 : 0, audioRef.current.currentTime, 0.03);
    }
  }

  function choosePreset(voice: VoicePreset) {
    setPreset(voice);
    if (active) {
      stopMicrophone();
      setError("Profil selectionne. Relancez le microphone pour appliquer l'effet.");
    }
  }

  useEffect(() => () => stopMicrophone(), []);

  return (
    <main>
      <nav>
        <div className="brand"><span className="brand-mark"><Radio size={20} /></span> StreamAI</div>
        <span className="badge free"><Gift size={15} /> Gratuit pour tous</span>
        <span className="badge"><ShieldCheck size={15} /> Traitement local</span>
      </nav>

      <section className="hero">
        <p className="eyebrow">STUDIO VOCAL GRATUIT POUR CREATEURS</p>
        <h1>Ta voix. Ton identite.<br /><span>En direct et gratuitement.</span></h1>
        <p className="intro">Aucun abonnement et aucune carte bancaire. Teste ton microphone et des effets audio locaux directement depuis ton navigateur.</p>
      </section>

      <section className="studio">
        <div className="panel main-panel">
          <div className="panel-title"><div><p>ENTREE AUDIO</p><h2>Microphone principal</h2></div><span className={active ? 'status live' : 'status'}>{active ? 'EN DIRECT' : 'ARRETE'}</span></div>

          <div className="meter" aria-label={`Niveau du microphone ${volume}%`}>
            <div className="meter-fill" style={{ width: `${volume}%` }} />
          </div>
          <div className="meter-labels"><span>-60 dB</span><span>-30 dB</span><span>0 dB</span></div>

          <div className="actions">
            <button className={active ? 'primary stop' : 'primary'} onClick={active ? stopMicrophone : startMicrophone}>
              {active ? <MicOff /> : <Mic />}
              {active ? 'Arreter le test' : 'Tester mon microphone'}
            </button>
            <button className={`secondary ${monitoring ? 'enabled' : ''}`} onClick={toggleMonitoring} disabled={!active}>
              <Volume2 /> {monitoring ? "Couper l'ecoute" : "Ecouter l'effet"}
            </button>
          </div>
          {monitoring && <p className="warning">Utilisez un casque pour eviter l'echo.</p>}
          {error && <p className="error">{error}</p>}
        </div>

        <aside className="panel">
          <div className="panel-title"><div><p>PROFIL GRATUIT ACTIF</p><h2>{preset.name}</h2></div><SlidersHorizontal /></div>
          <div className="preset-list">
            {presets.map((voice) => (
              <button key={voice.id} className={`preset ${preset.id === voice.id ? 'selected' : ''}`} onClick={() => choosePreset(voice)}>
                <span className="preset-icon">{voice.id === 'robot' ? 'R' : voice.pitch < 0 ? '↓' : voice.pitch > 0 ? '↑' : '='}</span>
                <span><strong>{voice.name}</strong><small>{voice.description}</small></span>
                <span className="pitch">{voice.pitch > 0 ? '+' : ''}{voice.pitch}</span>
              </button>
            ))}
          </div>
          <p className="notice">Tous les profils sont gratuits. Cette version applique deja une egalisation et une compression locales. Le changement de timbre par IA arrivera ensuite.</p>
        </aside>
      </section>

      <section className="steps">
        <article><span>01</span><h3>Gratuit</h3><p>Aucun abonnement requis pour utiliser les fonctions principales.</p></article>
        <article><span>02</span><h3>Confidentiel</h3><p>Le son est traite localement dans le navigateur.</p></article>
        <article><span>03</span><h3>Streaming</h3><p>La prochaine version ajoutera la sortie vers OBS et Discord.</p></article>
      </section>
    </main>
  );
}
