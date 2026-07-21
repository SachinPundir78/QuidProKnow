import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/userService';
import { requestService } from '../api/requestService';
import { checkCompatibility, matchingSkills } from '../utils/compatibility';
import { resolvePhotoUrl } from '../utils/resolvePhotoUrl';
import { Code, Briefcase, Globe, BookOpen, Link, AlertCircle, Check, X, Award, ArrowLeft } from 'lucide-react';

const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';

// ── Small helpers ──────────────────────────────────────────────────────────

function RatingBar({ value }) {
  const pct   = Math.round((value / 100) * 100);
  const color = value > 70 ? 'bg-emerald-600' : value > 40 ? 'bg-want' : 'bg-gray-400';
  const textColor = value > 70 ? 'text-emerald-600' : value > 40 ? 'text-want' : 'text-gray-500';
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden">
        <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${color}`} />
      </div>
      <span className={`text-xs font-bold ${textColor} min-w-[28px]`}>{value}</span>
    </div>
  );
}

function SocialLink({ href, icon, label }) {
  if (!href) return null;
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer" 
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 dark:border-white/10 hover:border-give/30 hover:bg-give-bg/30 dark:hover:bg-white/5 text-xs font-semibold text-gray-700 dark:text-zinc-300 rounded-full transition-all"
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

function parseProjects(jsonStr) {
  try { return JSON.parse(jsonStr || '[]'); } catch { return []; }
}

function parsePlatforms(csv) {
  if (!csv) return [];
  return csv.split(',').map(s => s.trim()).filter(Boolean);
}

// ── Main component ─────────────────────────────────────────────────────────

export default function UserProfile() {
  const { id }       = useParams();
  const { user: me } = useAuth();
  const navigate     = useNavigate();

  const [profile,  setProfile]  = useState(null);
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const [showRequest,  setShowRequest]  = useState(false);
  const [requestSkill, setRequestSkill] = useState('');
  const [comment,      setComment]      = useState('');
  const [sending,      setSending]      = useState(false);
  const [reqFeedback,  setReqFeedback]  = useState('');

  const [tab, setTab] = useState('about'); // 'about' | 'projects' | 'reviews'

  useEffect(() => {
    const uid = Number(id);
    if (!uid) { navigate('/browse'); return; }
    Promise.all([userService.getById(uid), userService.getReviews(uid)])
      .then(([u, r]) => { setProfile(u); setReviews(r); })
      .catch(() => setError('Could not load this profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 font-body"><p className="text-sm text-gray-500 animate-pulse">Loading…</p></div>;
  if (error)   return <div className="max-w-4xl mx-auto px-4 py-8 font-body"><div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div></div>;
  if (!profile) return null;

  const isOwnProfile = me?.id === profile.id;
  const compat       = isOwnProfile ? null : checkCompatibility(me, profile);
  const suggested    = compat?.compatible ? matchingSkills(me, profile) : [];

  const offered    = (profile.skills || []).filter(s => s.type === 'OFFER');
  const wanted     = (profile.skills || []).filter(s => s.type === 'WANT');
  const projects   = parseProjects(profile.projects);
  const platforms  = parsePlatforms(profile.learningPlatforms);

  const hasSocialLinks = profile.githubUrl || profile.linkedinUrl || profile.websiteUrl || platforms.length > 0;

  const openRequest = () => {
    setShowRequest(true); setReqFeedback(''); setComment('');
    setRequestSkill(suggested[0] || '');
  };

  const sendRequest = async () => {
    if (!requestSkill.trim()) { setReqFeedback('Enter the skill you want to learn.'); return; }
    setSending(true); setReqFeedback('');
    try {
      await requestService.send({ receiverId: profile.id, skillWanted: requestSkill.trim(), comment });
      setReqFeedback('success');
      setTimeout(() => setShowRequest(false), 1400);
    } catch (err) {
      setReqFeedback(err.response?.data?.message || 'Could not send the request.');
    } finally { setSending(false); }
  };

  const tabBtn = (key, label, count) => (
    <button 
      onClick={() => setTab(key)} 
      className={`shrink-0 px-4 sm:px-5 py-3 border-b-2 font-medium text-sm transition-all ${
        tab === key 
          ? 'border-give text-give font-bold' 
          : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-give dark:hover:text-orange-400 hover:border-gray-300 dark:hover:border-white/20'
      }`}
    >
      {label}{count !== undefined ? ` (${count})` : ''}
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sach text-slate-900 dark:text-zinc-100">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 sm:mb-5 inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      {/* ── Hero card ── */}
      <div className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-black/20 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
          {/* Avatar */}
          <div className="w-[5.5rem] h-[5.5rem] sm:w-24 sm:h-24 rounded-full bg-give-bg text-give flex items-center justify-center overflow-hidden text-2xl sm:text-3xl font-display font-bold border border-give/10 shrink-0">
            {profile.profilePhotoUrl ? (
              <img 
                src={resolvePhotoUrl(API, profile.profilePhotoUrl)} 
                alt={profile.name}
                className="w-full h-full object-cover" 
              />
            ) : (
              profile.name?.[0]?.toUpperCase()
            )}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            {/* Name + badges */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 justify-center sm:justify-start">
              <h1 className="font-display font-bold text-3xl sm:text-2xl text-gray-900 dark:text-white leading-none">{profile.name}</h1>
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full badge-${profile.badge}`}>
                  {profile.badge}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-zinc-300 text-[10px] font-bold rounded-full">
                  {profile.userType === 'BARTER_USER' ? 'Barter user' : 'Learner'}
                </span>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-500 dark:text-zinc-400 text-sm mb-4 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="grid w-full max-w-sm grid-cols-[1.5fr_1fr_1fr] divide-x divide-gray-200 dark:divide-white/10 justify-center sm:justify-start mb-4">
              <div className="flex items-baseline justify-center sm:justify-start gap-1 pr-3">
                <span className="font-display text-xl font-bold text-give">
                  {profile.totalRatings > 0 ? profile.averageRating.toFixed(1) : '—'}
                </span>
                <span className="text-gray-400 dark:text-zinc-500 text-xs font-semibold">
                  avg ({profile.totalRatings} {profile.totalRatings === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              <div className="flex items-baseline justify-center gap-1 px-3">
                <span className="font-display text-xl font-bold text-give">{profile.points}</span>
                <span className="text-gray-400 dark:text-zinc-500 text-xs font-semibold">pts</span>
              </div>
              {profile.age > 0 && (
                <div className="flex items-baseline justify-center gap-1 pl-3">
                  <span className="font-display text-xl font-bold text-give">{profile.age}</span>
                  <span className="text-gray-400 dark:text-zinc-500 text-xs font-semibold">yrs</span>
                </div>
              )}
            </div>

            {/* Social links row */}
            {hasSocialLinks && (
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                <SocialLink 
                  href={profile.githubUrl} 
                  icon={<Code className="w-3.5 h-3.5 text-gray-700" />} 
                  label="GitHub" 
                />
                <SocialLink 
                  href={profile.linkedinUrl} 
                  icon={<Briefcase className="w-3.5 h-3.5 text-blue-700" />} 
                  label="LinkedIn" 
                />
                <SocialLink 
                  href={profile.websiteUrl} 
                  icon={<Globe className="w-3.5 h-3.5 text-emerald-600" />} 
                  label="Portfolio" 
                />
                {platforms.map((url, i) => (
                  <SocialLink 
                    key={i} 
                    href={url} 
                    icon={<BookOpen className="w-3.5 h-3.5 text-purple-600" />}
                    label={extractPlatformName(url)} 
                  />
                ))}
              </div>
            )}

            {/* Compatibility / request button */}
            {!isOwnProfile && (
              compat?.compatible ? (
                <div className="mt-4">
                  <button 
                    className="w-full sm:w-auto px-5 py-2.5 mb-2 bg-give hover:brightness-110 text-white rounded-full text-sm font-semibold shadow-lg shadow-give/10 transition-all"
                    onClick={openRequest}
                  >
                    Request a session
                  </button>
                  {suggested.length > 0 && (
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-zinc-500 font-medium">
                      Matching skill{suggested.length > 1 ? 's' : ''}: <strong className="text-give">{suggested.join(', ')}</strong>
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 rounded-xl p-4 max-w-md text-left">
                  <p className="text-xs font-bold text-want flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Cannot send a request</span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-zinc-300 mt-1 font-medium leading-relaxed">
                    {compat?.reason}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="-mx-4 sm:mx-0 flex overflow-x-auto px-4 sm:px-0 border-b border-gray-200 dark:border-white/10 mb-6">
        {tabBtn('about',    'About')}
        {projects.length > 0 && tabBtn('projects', 'Projects', projects.length)}
        {tabBtn('reviews', 'Reviews', reviews.length)}
      </div>

      {/* ════════════ ABOUT tab ════════════ */}
      {tab === 'about' && (
        <div className="space-y-4">
          {/* Skills */}
          {(offered.length > 0 || wanted.length > 0) && (
            <div className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-sm dark:shadow-black/20">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-white/10 mb-4">Skills</h3>
              
              {offered.length > 0 && (
                <div className="mb-4">
                  <p className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold tracking-wider uppercase mb-2">Can teach</p>
                  <div className="flex flex-wrap gap-1.5">
                    {offered.map(s => (
                      <span key={s.id} className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-400/20 text-xs font-semibold rounded-full">
                        ✦ {s.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {wanted.length > 0 && (
                <div>
                  <p className="text-gray-400 dark:text-zinc-500 text-[10px] font-bold tracking-wider uppercase mb-2">Wants to learn</p>
                  <div className="flex flex-wrap gap-1.5">
                    {wanted.map(s => (
                      <span key={s.id} className="px-2.5 py-0.5 bg-want-bg dark:bg-rose-400/10 text-want dark:text-rose-300 text-xs font-semibold rounded-full">
                        ◈ {s.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Projects preview */}
          {projects.length > 0 && (
            <div className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-sm dark:shadow-black/20">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-white/10 mb-4">
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">Projects</h3>
                {projects.length > 2 && (
                  <button 
                    className="px-3 py-1 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-600 dark:text-zinc-300 rounded-md text-xs font-semibold transition-all" 
                    onClick={() => setTab('projects')}
                  >
                    View all {projects.length}
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {projects.slice(0, 2).map((p, i) => <ProjectCard key={i} project={p} />)}
              </div>
            </div>
          )}

          {/* Learning platforms */}
          {platforms.length > 0 && (
            <div className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-sm dark:shadow-black/20">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-white/10 mb-4">Learning platforms</h3>
              <div className="space-y-2">
                {platforms.map((url, i) => (
                  <a 
                    key={i} 
                    href={url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-give hover:underline flex gap-2 items-center"
                  >
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-gray-900 dark:text-zinc-100">{extractPlatformName(url)}</span>
                    <span className="text-gray-400 dark:text-zinc-500">({url.replace(/^https?:\/\//, '').split('/')[0]})</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {offered.length === 0 && wanted.length === 0 && projects.length === 0 && !hasSocialLinks && (
            <div className="text-center py-12 bg-gray-50 dark:bg-zinc-900/60 border border-dashed border-gray-200 dark:border-white/15 rounded-xl">
              <h3 className="font-display text-lg font-bold text-gray-800 dark:text-white mb-1">Nothing here yet</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">This user hasn't added skills or links to their profile.</p>
            </div>
          )}
        </div>
      )}

      {/* ════════════ PROJECTS tab ════════════ */}
      {tab === 'projects' && (
        <div>
          {projects.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-zinc-900/60 border border-dashed border-gray-200 dark:border-white/15 rounded-xl">
              <h3 className="font-display text-lg font-bold text-gray-800 dark:text-white mb-1">No projects listed</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((p, i) => <ProjectCard key={i} project={p} />)}
            </div>
          )}
        </div>
      )}

      {/* ════════════ REVIEWS tab ════════════ */}
      {tab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-zinc-900/60 border border-dashed border-gray-200 dark:border-white/15 rounded-xl">
              <h3 className="font-display text-lg font-bold text-gray-800 dark:text-white mb-1">No reviews yet</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">Reviews appear here after completed sessions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.sessionId} className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-sm dark:shadow-black/20">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-want-bg text-want flex items-center justify-center overflow-hidden text-sm font-bold border border-want/10 shrink-0">
                      {r.reviewerPhotoUrl ? (
                        <img 
                          src={resolvePhotoUrl(API, r.reviewerPhotoUrl)} 
                          alt={r.reviewerName}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        r.reviewerName?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="font-display font-bold text-sm text-gray-900 dark:text-white">{r.reviewerName}</span>
                        <span className="text-gray-400 dark:text-zinc-500 text-xs">
                          on "{r.skill}"
                          {r.sessionDate && ` · ${new Date(r.sessionDate).toLocaleDateString(undefined,
                            { month: 'short', day: 'numeric', year: 'numeric' })}`}
                        </span>
                      </div>
                      <div className="max-w-[200px] mb-2">
                        <RatingBar value={r.rating} />
                      </div>
                      {r.review && (
                        <p className="text-sm text-gray-700 dark:text-zinc-300 bg-gray-50/50 dark:bg-black/20 p-3 rounded-lg border-l-2 border-give italic">
                          "{r.review}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Request modal ── */}
      {showRequest && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl max-w-md w-full">
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-1">Request session with {profile.name}</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4 leading-normal font-medium">
              {me?.userType === 'LEARNER'
                ? 'One-way learning — 25 points deducted if accepted.'
                : 'Barter exchange — no points required.'}
            </p>

            {suggested.length > 0 && (
              <div className="mb-4">
                  <p className="text-gray-400 dark:text-zinc-500 text-[10px] font-bold tracking-wider uppercase mb-2">
                  Matching Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggested.map(s => (
                    <button 
                      key={s} 
                      onClick={() => setRequestSkill(s)} 
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        requestSkill === s 
                          ? 'border-give bg-give-bg text-give' 
                          : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 mb-4">
               <label className="text-xs font-semibold text-gray-600 dark:text-zinc-300">Skill you want to learn</label>
              <input 
                value={requestSkill} 
                onChange={e => setRequestSkill(e.target.value)}
                placeholder="Which skill specifically?"
                className="px-3.5 py-2 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-zinc-100"
              />
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
               <label className="text-xs font-semibold text-gray-600 dark:text-zinc-300">Message (optional)</label>
              <textarea 
                rows={3} 
                value={comment} 
                onChange={e => setComment(e.target.value)}
                placeholder="Tell them what you'd like to learn…" 
                className="px-3.5 py-2 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-zinc-100"
              />
            </div>

            {reqFeedback === 'success' ? (
              <div className="mb-4 text-emerald-600 text-sm font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Request sent!</span>
              </div>
            ) : reqFeedback ? (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reqFeedback}</span>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button 
                className="px-4 py-2 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-zinc-300 rounded-md text-xs font-semibold transition-all" 
                onClick={() => setShowRequest(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-give hover:brightness-110 text-white rounded-md text-xs font-semibold shadow-md shadow-give/5 transition-all disabled:opacity-50"
                disabled={sending} 
                onClick={sendRequest}
              >
                {sending ? 'Sending…' : 'Send request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({ project: p }) {
  return (
    <div className="border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-black/20 rounded-xl p-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm text-gray-900 dark:text-white mb-0.5">{p.title}</p>
          {p.description && (
            <p className="text-gray-500 dark:text-zinc-400 text-xs mb-2 leading-relaxed">{p.description}</p>
          )}
          {p.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {p.tags.map(t => (
                <span key={t} className="text-[9px] px-2 py-0.5 bg-give-bg text-give font-bold rounded-full">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        {p.url && (
          <a 
            href={p.url} 
            target="_blank" 
            rel="noreferrer" 
            className="px-3 py-1 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-zinc-300 rounded-md text-xs font-semibold transition-all shrink-0"
          >
            View →
          </a>
        )}
      </div>
      {p.url && (
        <p className="text-gray-400 dark:text-zinc-500 text-[10px] mt-1 inline-flex items-center gap-1 font-semibold">
          <Link className="w-3.5 h-3.5" />
          <span>{p.url.replace(/^https?:\/\//, '')}</span>
        </p>
      )}
    </div>
  );
}

// ── Utility: extract a readable name from a learning platform URL ─────────────

function extractPlatformName(url) {
  try {
    const host = new URL(url.startsWith('http') ? url : 'https://' + url).hostname.replace('www.', '');
    const known = {
      'coursera.org': 'Coursera', 'udemy.com': 'Udemy', 'edx.org': 'edX',
      'freecodecamp.org': 'freeCodeCamp', 'leetcode.com': 'LeetCode',
      'hackerrank.com': 'HackerRank', 'kaggle.com': 'Kaggle',
      'pluralsight.com': 'Pluralsight', 'linkedin.com': 'LinkedIn Learning',
      'skillshare.com': 'Skillshare', 'codecademy.com': 'Codecademy',
      'khanacademy.org': 'Khan Academy',
    };
    return known[host] || host.split('.')[0].charAt(0).toUpperCase() + host.split('.')[0].slice(1);
  } catch {
    return 'Platform';
  }
}
