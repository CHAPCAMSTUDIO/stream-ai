import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Radio, ShieldCheck, SlidersHorizontal } from 'lucide-react';

type VoicePreset = {
  id: string;
  name: string;
  description: string;
  pitch: number;
};

const presets: VoicePreset[] = [
  { id: 'natural', name: 'Naturelle+', description: 'Voix claire pour discussion', pitch: 0 },
  { id: 'deep', name: 'Grave Studio', description: 'Voix profonde et chaleureuse', pitch: -7 },
  { id: 'bright', name: 'Énergie Live', description: 'Voix brillante pour le streaming', pitch: 5 },
];

export default function App() {
  const [active, setActive] = useState(false);
  const [preset, setPreset] = useState(presets[0]);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  async function startMicrophone() {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const context = new AudioContext();
      audioRef.current = context;
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      context.createMediaStreamSource(stream).connect(analyser);
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
      setError("Accès au microphone refusé. Autorisez-le dans votre navigateur.");
    }
  }

  function stopMicrophone() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioRef.current?.close();
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    streamRef.current = null;
    audioRef.current = null;
    setVolume(0);
    setActive(false);
  }

  useEffect(() => () => stopMicrophone(), []);

  return (
    <main>
      <nav>
        <div className="brand"><span className="brand-mark"><Radio size={20} /></span> StreamAI</div>
        <span className="badge"><ShieldCheck size={15} /> Traitement local</span>
      </nav>

      <section className="hero">
        <p className="eyebrow">STUDIO VOCAL POUR CRÉATEURS</p>
        <h1>Ta voix. Ton identité.<br /><span>En direct.</span></h1>
        <p className="intro">Une première interface fonctionnelle pour tester ton microphone, choisir un profil vocal et préparer l'intégration à OBS et Discord.</p>
      </section>

      <section className="studio">
        <div className="panel main-panel">
          <div className="panel-title"><div><p>ENTRÉE AUDIO</p><h2>Microphone principal</h2></div><span className={active ? 'status live' : 'status'}>{active ? 'EN DIRECT' : 'ARRÊTÉ'}</span></div>

          <div className="meter" aria-label={`Niveau du microphone ${volume}%`}>
            <div className="meter-fill" style={{ width: `${volume}%` }} />
          </div>
          <div className="meter-labels"><span>-60 dB</span><span>-30 dB</span><span>0 dB</span></div>

          <button className={active ? 'primary stop' : 'primary'} onClick={active ? stopMicrophone : startMicrophone}>
            {active ? <MicOff /> : <Mic />}
            {active ? 'Arrêter le test' : 'Tester mon microphone'}
          </button>
          {error && <p className="error">{error}</p>}
        </div>

        <aside className="panel">
          <div className="panel-title"><div><p>PROFIL ACTIF</p><h2>{preset.name}</h2></div><SlidersHorizontal /></div>
          <div className="preset-list">
            {presets.map((voice) => (
              <button key={voice.id} className={`preset ${preset.id === voice.id ? 'selected' : ''}`} onClick={() => setPreset(voice)}>
                <span className="preset-icon">{voice.pitch < 0 ? '↓' : voice.pitch > 0 ? '↑' : '='}</span>
                <span><strong>{voice.name}</strong><small>{voice.description}</small></span>
                <span className="pitch">{voice.pitch > 0 ? '+' : ''}{voice.pitch}</span>
              </button>
            ))}
          </div>
          <p className="notice">Ces profils préparent l'interface. Le moteur IA sera branché dans l'étape suivante.</p>
        </aside>
      </section>

      <section className="steps">
        <article><span>01</span><h3>Microphone</h3><p>Capture audio et mesure du niveau en temps réel.</p></article>
        <article><span>02</span><h3>Moteur vocal</h3><p>Transformation locale avec une faible latence.</p></article>
        <article><span>03</span><h3>Streaming</h3><p>Sortie vers OBS, Discord et les jeux.</p></article>
      </section>
    </main>
  );
}
