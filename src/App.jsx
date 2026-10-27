import { useState } from 'react';

const steps = [
  'Edit src/App.jsx to make this project yours.',
  'Add components and styles as your idea takes shape.',
  'Run npm run build when you are ready to ship.',
];

export default function App() {
  const [checked, setChecked] = useState([]);

  function toggleStep(index) {
    setChecked((current) =>
      current.includes(index)
        ? current.filter((step) => step !== index)
        : [...current, index],
    );
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="React starter home">
          <span className="brand-mark">R</span>
          <span>React starter</span>
        </a>
        <span className="status"><span className="status-dot" /> Ready to build</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">YOUR NEXT IDEA STARTS HERE</p>
          <h1>A little space<br />to make <span>something great.</span></h1>
          <p className="intro">
            Your React project is ready. Start with the essentials, then shape it into whatever you have in mind.
          </p>
          <a className="primary-link" href="#checklist">Explore your starter <span aria-hidden="true">↓</span></a>
        </div>
        <div className="orbital-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="core">R<span>✳</span></div>
          <span className="spark spark-a">✦</span>
          <span className="spark spark-b">✧</span>
          <span className="spark spark-c">·</span>
        </div>
      </section>

      <section className="checklist-card" id="checklist">
        <div className="card-heading">
          <div>
            <p className="eyebrow">A QUICK START</p>
            <h2>Make it yours</h2>
          </div>
          <span className="count">{checked.length} / {steps.length}</span>
        </div>
        <div className="progress-track"><span style={{ width: `${(checked.length / steps.length) * 100}%` }} /></div>
        <ul className="steps">
          {steps.map((step, index) => (
            <li key={step}>
              <button className={`step ${checked.includes(index) ? 'is-checked' : ''}`} onClick={() => toggleStep(index)}>
                <span className="checkbox" aria-hidden="true">{checked.includes(index) ? '✓' : ''}</span>
                <span>{step}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <footer><span>Built with React</span><span>Good things begin with a first step.</span></footer>
    </main>
  );
}
