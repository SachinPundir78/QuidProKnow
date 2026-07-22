import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/userService';
import { requestService } from '../api/requestService';
import UserCard from '../components/UserCard';
import { checkCompatibility, matchingSkills } from '../utils/compatibility';
import { Target, Search, AlertCircle, Check } from 'lucide-react';

export default function BrowseUsers() {
  const { user } = useAuth();

  // Search mode: 'skill' or 'name'
  const [searchMode, setSearchMode] = useState('skill');
  const [skillQuery, setSkillQuery] = useState('');
  const [nameQuery, setNameQuery] = useState('');

  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchErr, setSearchErr] = useState('');
  const searchRequestId = useRef(0);

  // Request modal state
  const [requestTarget, setRequestTarget] = useState(null);
  const [comment, setComment] = useState('');
  const [requestSkill, setRequestSkill] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const query = (searchMode === 'skill' ? skillQuery : nameQuery).trim();
    const requestId = ++searchRequestId.current;
    setSearchErr('');
    if (!query) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setSearched(true);
      try {
        const data = searchMode === 'skill'
          ? await userService.search(query)
          : await userService.searchByName(query);
        if (requestId === searchRequestId.current) setResults(data);
      } catch (err) {
        if (requestId === searchRequestId.current) {
          setResults([]);
          setSearchErr(err.response?.data?.message || 'Search failed. Please try again.');
        }
      } finally {
        if (requestId === searchRequestId.current) setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchMode, skillQuery, nameQuery]);

  const handleSearch = (e) => e.preventDefault();

  const openRequest = (target) => {
    setRequestTarget(target);
    setComment('');
    setFeedback('');
    if (user.userType === 'LEARNER') {
      // Pre-fill with a skill that actually matches the learner's WANT list
      const matches = matchingSkills(user, target);
      setRequestSkill(matches[0] || '');
    } else {
      // Pre-fill with searched skill if in skill mode, otherwise empty
      setRequestSkill(searchMode === 'skill' ? skillQuery.trim() : '');
    }
  };

  const sendRequest = async () => {
    if (!requestSkill.trim()) { setFeedback('Specify the skill you want to learn.'); return; }
    setSending(true); setFeedback('');
    try {
      await requestService.send({
        receiverId: requestTarget.id,
        skillWanted: requestSkill.trim(),
        comment,
      });
      setFeedback('success');
      setTimeout(() => setRequestTarget(null), 1500);
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Could not send the request.');
    } finally { setSending(false); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 font-display">
      <div className="mb-8 pb-6 border-b border-gray-200/70 dark:border-zinc-800/70">
        <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white">Browse users</h1>
        <p className="text-md font-normal text-gray-500 dark:text-zinc-400 mt-1">Search by skill to find a teacher, or by name to find someone specific.</p>
      </div>

      {/* Search mode tabs */}
      <div className="flex border-b border-gray-200/70 dark:border-zinc-800/70 mb-6">
        <button
          onClick={() => { setSearchMode('skill'); setResults([]); setSearched(false); }}
          className={`px-5 py-3 border-b-2 font-medium text-sm transition-all flex items-center gap-2 ${searchMode === 'skill'
              ? 'border-give text-give font-bold'
              : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-give hover:border-gray-300 dark:hover:border-zinc-700'
            }`}
        >
          <Target className="w-4 h-4" />
          <span>Search by skill</span>
        </button>
        <button
          onClick={() => { setSearchMode('name'); setResults([]); setSearched(false); }}
          className={`px-5 py-3 border-b-2 font-medium text-sm transition-all flex items-center gap-2 ${searchMode === 'name'
              ? 'border-give text-give font-bold'
              : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-give hover:border-gray-300 dark:hover:border-zinc-700'
            }`}
        >
          <Search className="w-4 h-4" />
          <span>Search by name</span>
        </button>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8 bg-white/80 dark:bg-zinc-900/55 backdrop-blur-md p-5 border border-gray-200/80 dark:border-zinc-700/70 rounded-xl shadow-sm">
        {searchMode === 'skill' ? (
          <div className="flex flex-col gap-1.5 flex-1">
            <label htmlFor="skillWanted" className="text-xs font-semibold text-gray-600 dark:text-zinc-300">Skill to learn</label>
            <input
              id="skillWanted"
              value={skillQuery}
              onChange={e => setSkillQuery(e.target.value)}
              placeholder="e.g. Photoshop, Spanish, Guitar…"
              className="px-3.5 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50 dark:bg-zinc-950/45 dark:text-white dark:placeholder:text-zinc-500"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 flex-1">
            <label htmlFor="nameQuery" className="text-xs font-semibold text-gray-600 dark:text-zinc-300">User's name</label>
            <input
              id="nameQuery"
              value={nameQuery}
              onChange={e => setNameQuery(e.target.value)}
              placeholder="e.g. Rahul, Priya…"
              className="px-3.5 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50 dark:bg-zinc-950/45 dark:text-white dark:placeholder:text-zinc-500"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-give hover:brightness-110 text-white rounded-lg text-sm font-semibold shadow-lg shadow-give/10 transition-all disabled:opacity-50 shrink-0 h-[42px]"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {searchErr && (
        <div className="mb-6 bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg">
          {searchErr}
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <div className="text-center py-16 bg-white/55 dark:bg-zinc-900/40 backdrop-blur-md border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl">
          <h3 className="font-display text-lg font-bold text-gray-800 dark:text-white mb-1">No matches found</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {searchMode === 'skill'
              ? 'Nobody currently offers that skill. Try a broader search term.'
              : 'No user found with that name. Try a different spelling.'}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {results.map(u => {
          const compat = checkCompatibility(user, u);
          return (
            <UserCard key={u.id} user={u}
              action={
                compat.compatible ? (
                  <button
                    className="px-3 py-1.5 bg-give hover:brightness-110 text-white rounded-md text-xs font-semibold shadow-md shadow-give/5 transition-all"
                    onClick={() => openRequest(u)}
                  >
                    Request session
                  </button>
                ) : (
                  <span
                    title={compat.reason}
                    className="text-gray-400 text-[11px] max-w-[150px] text-right leading-tight font-medium"
                  >
                    ⚠ Not compatible
                  </span>
                )
              }
            />
          );
        })}
      </div>

      {/* Request modal */}
      {requestTarget && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 dark:bg-zinc-900/70 backdrop-blur-xl border border-gray-200 dark:border-zinc-700/80 rounded-2xl p-6 shadow-2xl max-w-md w-full">
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-1">Request session with {requestTarget.name}</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4 leading-normal font-medium">
              {user.userType === 'LEARNER'
                ? 'One-way learning request — 25 points deducted if accepted.'
                : 'Barter exchange — no points involved.'}
            </p>

            <div className="flex flex-col gap-1.5 mb-4">
              <label htmlFor="reqSkill" className="text-xs font-semibold text-gray-600 dark:text-zinc-300">Skill you want to learn</label>
              <input
                id="reqSkill"
                value={requestSkill}
                onChange={e => setRequestSkill(e.target.value)}
                placeholder="Which skill specifically?"
                className="px-3.5 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50 dark:bg-zinc-950/45 dark:text-white"
              />
              {/* Quick-pick chips */}
              {(() => {
                const chipSkills = user.userType === 'LEARNER'
                  ? matchingSkills(user, requestTarget)
                  : (requestTarget.skills || []).filter(s => s.type === 'OFFER').map(s => s.skillName);
                if (chipSkills.length === 0) return null;
                return (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {chipSkills.map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setRequestSkill(name)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${requestSkill === name
                            ? 'border-give bg-give-bg text-give'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-col gap-1.5 mb-4">
              <label htmlFor="comment" className="text-xs font-semibold text-gray-600 dark:text-zinc-300">Message (optional)</label>
              <textarea
                id="comment"
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tell them what you'd like to learn…"
                className="px-3.5 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50 dark:bg-zinc-950/45 dark:text-white"
              />
            </div>

            {feedback === 'success' ? (
              <div className="mb-4 text-emerald-600 text-sm font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Request sent!</span>
              </div>
            ) : feedback ? (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedback}</span>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md text-xs font-semibold transition-all"
                onClick={() => setRequestTarget(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-give hover:brightness-110 text-white rounded-md text-xs font-semibold shadow-md shadow-give/5 transition-all disabled:opacity-50"
                onClick={sendRequest}
                disabled={sending}
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
