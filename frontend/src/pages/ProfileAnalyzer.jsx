import { useState, useEffect } from 'react';
import { Loader2, BrainCircuit, Sparkles, TrendingUp, AlertTriangle, Target, CheckCircle2 } from 'lucide-react';
import { analyzeProfile, getLatestAnalysis } from '../api/profileAnalyzerService';

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreRing({ score }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const filled = (score / 100) * circ;

  let color = 'text-red-500 stroke-red-500';
  let label = 'Needs Work';
  let labelColor = 'text-red-600 dark:text-red-400';

  if (score >= 75) {
    color = 'text-emerald-500 stroke-emerald-500';
    label = 'Excellent';
    labelColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (score >= 50) {
    color = 'text-amber-500 stroke-amber-500';
    label = 'Good';
    labelColor = 'text-amber-600 dark:text-amber-400';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-40 w-40">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            className={`${color} transition-all duration-1000 ease-out`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            strokeDashoffset="0"
          />
        </svg>
        {/* Inner text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">{score}</span>
          <span className="mt-1 text-xs font-medium text-slate-400">out of 100</span>
        </div>
      </div>
      <div className={`mt-3 text-xs font-bold tracking-[0.16em] uppercase ${labelColor}`}>{label}</div>
    </div>
  );
}

function Chip({ text, type }) {
  const styles = {
    strength: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50",
    weakness: "bg-red-200 text-red-600 dark:bg-red-200 dark:text-red-600 border border-red-600 dark:border-red-700"
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${styles[type]} `}>
      {text}
    </span>
  );
}

function Card({ title, icon: Icon, children, accentColor }) {
  const iconColors = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        {Icon && <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconColors[accentColor] || iconColors.blue}`}><Icon className="h-4.5 w-4.5" /></span>}
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function SuggestionItem({ text, index }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
        {index + 1}
      </div>
      <p className="m-0 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">{text}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProfileAnalyzer() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getLatestAnalysis()
      .then(r => setAnalysis(r.data))
      .catch(() => { /* no prior analysis yet */ })
      .finally(() => setLoadingLatest(false));
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await analyzeProfile();
      setAnalysis(data);
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 sm:p-7 md:flex-row md:items-center">
        <div>
          <p className="mb-2 text-md font-bold font-sach uppercase  tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Profile intelligence</p>
          <h1 className="mb-2 flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"><BrainCircuit className="h-5 w-5" /></span>
            AI Profile Analyzer
          </h1>
          <p className="max-w-xl text-md font-sach leading-relaxed text-slate-600 dark:text-zinc-400">
            Get personalized recommendations to improve your QuidProKnow profile
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm !font-display font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Analyze My Profile</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-800/50">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Initial loading skeleton */}
      {loadingLatest && <Skeleton />}

      {/* No analysis yet */}
      {!loadingLatest && !analysis && !loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center dark:border-zinc-700 dark:bg-zinc-900/70">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mb-6">
            <BrainCircuit className="w-10 h-10 text-emerald-500 opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">No analysis yet</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            Click <strong className="text-slate-700 dark:text-slate-300">Analyze My Profile</strong> above to get your personalized score and AI feedback powered by Groq.
          </p>
        </div>
      )}

      {/* Loading skeleton while AI runs */}
      {loading && !loadingLatest && <Skeleton />}

      {/* Results */}
      {analysis && !loading && (
        <div className="space-y-6">
          {analysis.cached && (
          <div className="flex items-center justify-end gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-sach">Showing cached result — click Analyze to refresh</span>
            </div>
          )}

          {/* Score + summary row */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Score Box */}
            <section className="flex flex-col items-center justify-center font-sach rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
              <ScoreRing score={analysis.profileScore} />
              <div className="mt-5 text-md !font-sach font-bold  tracking-[0.14em] text-slate-400 dark:text-zinc-500">Overall profile score</div>
            </section>

            {/* AI Insights */}
            <section className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 shadow-sm dark:border-indigo-900/70 dark:from-indigo-950/50 dark:via-zinc-900 dark:to-blue-950/30 md:p-8 lg:col-span-2">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <BrainCircuit className="w-32 h-32 text-indigo-600 dark:text-indigo-400" />
              </div>

              <div className="relative z-10">
                <div className="mb-5 flex items-center gap-3">
                  <div className="bg-indigo-600 text-white p-2 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Insights</h3>
                  <span className="ml-auto text-sm font-sach font-bold px-2.5 py-1 bg-white/60 dark:bg-black/20 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200/50 dark:border-indigo-700/50">
                    Groq · Llama 3
                  </span>
                </div>
                <p className="max-w-2xl text-md font-medium font-sach leading-7 text-slate-600 dark:text-zinc-300">
                  {analysis.aiFeedback}
                </p>
              </div>
            </section>
          </div>

          {/* Strengths & Weaknesses row */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Card title="Strengths" icon={TrendingUp} accentColor="emerald">
              <div className="flex flex-wrap gap-2 font-sach ">
                {analysis.strengths.length === 0
                  ? <p className="text-sm text-slate-500 font-sach dark:text-slate-400">Complete more profile sections to unlock strengths.</p>
                  : analysis.strengths.map((s, idx) => (
                    <Chip key={idx} text={s} type="strength" />
                  ))
                }
              </div>
            </Card>

            <Card title="Areas to Improve" icon={AlertTriangle} accentColor="amber">
              <div className="flex flex-wrap gap-2 font-sach font-md font-medium">
                {analysis.weaknesses.length === 0
                  ? <p className="text-sm text-slate-500  dark:text-slate-400">Great work — no major gaps found!</p>
                  : analysis.weaknesses.map((w, idx) => (
                    <Chip key={idx} text={w} type="weakness" />
                  ))
                }
              </div>
            </Card>
          </div>

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <Card title="Actionable Improvement Suggestions" icon={Target} accentColor="blue">
              <div className="space-y-3 font-sach font-medium text-md">
                {analysis.suggestions.map((s, i) => (
                  <SuggestionItem key={i} text={s} index={i} />
                ))}
              </div>
            </Card>
          )}

          <div className="text-right text-sm font-sach font-medium text-slate-400 mt-2">
            Last analyzed: {new Date(analysis.createdAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
