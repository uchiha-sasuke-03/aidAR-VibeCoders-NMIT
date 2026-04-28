import { Activity, FlaskConical, ScanLine, MessageSquare } from 'lucide-react';

export default function WelcomePage({ onNavigate }) {
  const features = [
    {
      icon: <Activity size={24} />,
      colorClass: 'blue',
      title: 'Real-Time Digital Twin',
      desc: 'A live virtual replica of your health. Monitor vitals, risks, and trends in real time.',
    },
    {
      icon: <FlaskConical size={24} />,
      colorClass: 'purple',
      title: 'What-If Simulations',
      desc: 'Test medications and lifestyle changes on your digital twin before applying them for real.',
    },
    {
      icon: <ScanLine size={24} />,
      colorClass: 'cyan',
      title: 'OCR Report Scanner',
      desc: 'Upload paper medical reports. AI reads, extracts, and structures the data automatically.',
    },
    {
      icon: <MessageSquare size={24} />,
      colorClass: 'green',
      title: 'AI Health Assistant',
      desc: 'Chat with an AI that understands your full medical context — powered by OpenAI GPT.',
    },
  ];

  return (
    <div className="welcome-page fade-in">
      <h2>Smart Healthcare Digital Twin</h2>
      <p className="subtitle">
        Proactive, personalized medicine. Your virtual health replica powered by AI — predicting outcomes,
        simulating treatments, and catching silent risks before they become problems.
      </p>

      <div className="feature-cards">
        {features.map((f, i) => (
          <div
            key={i}
            className={`feature-card fade-in fade-in-delay-${i + 1}`}
            onClick={() => {
              if (i === 0) onNavigate('register');
              if (i === 1) onNavigate('simulate');
              if (i === 2) onNavigate('ocr');
              if (i === 3) onNavigate('chat');
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className={`feature-icon ${f.colorClass}`}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40 }}>
        <button className="btn btn-primary" onClick={() => onNavigate('register')}>
          Create Your Digital Twin →
        </button>
      </div>
    </div>
  );
}
