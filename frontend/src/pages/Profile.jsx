import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/userService';
import SkillTagInput from '../components/SkillTagInput';
import { resolvePhotoUrl } from '../utils/resolvePhotoUrl';
import { Link, Trash2, X, Plus, Camera, Loader2 } from 'lucide-react';
import { FaUserCircle, FaGithub, FaLinkedin, FaGlobe, FaGraduationCap, FaUser, FaFolderOpen } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseProjects(jsonStr) {
  try { return JSON.parse(jsonStr || '[]'); } catch { return []; }
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#191919] dark:shadow-black/20 sm:p-6">
      <h3 className="mb-5 flex items-center gap-2.5 border-b border-gray-200 pb-3 text-lg font-bold text-gray-900 dark:border-zinc-800 dark:text-zinc-100">
        {Icon && <Icon className="h-4 w-4 text-orange-500" />}{title}
      </h3>
      {children}
    </section>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, updateLocalUser } = useAuth();
  const fileRef = useRef();

  const [form, setForm] = useState({
    name:              user.name,
    email:             user.email,
    password:          '',
    age:               user.age,
    bio:               user.bio || '',
    githubUrl:         user.githubUrl || '',
    linkedinUrl:       user.linkedinUrl || '',
    websiteUrl:        user.websiteUrl || '',
    learningPlatforms: user.learningPlatforms || '',
  });

  const [projects, setProjects] = useState(parseProjects(user.projects));

  // each project: { title, description, url, tags (array) }
  const [newProject, setNewProject] = useState({ title: '', description: '', url: '', tags: '' });
  const [addingProject, setAddingProject] = useState(false);

  const [saving, setSaving]             = useState(false);
  const [message, setMessage]           = useState('');
  const [error, setError]               = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [skillsState, setSkillsState]   = useState({
    OFFER: (user.skills || []).filter(s => s.type === 'OFFER'),
    WANT:  (user.skills || []).filter(s => s.type === 'WANT'),
  });
  const [addingSkill, setAddingSkill]   = useState(false);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setError(''); setMessage(''); }, 3500);
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Save profile ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      const updated = await userService.updateProfile({
        ...form,
        age: Number(form.age) || 0,
        projects: JSON.stringify(projects),
      });
      updateLocalUser(updated);
      setForm(f => ({ ...f, password: '' }));
      flash('Profile updated successfully.');
    } catch (err) {
      flash(err.response?.data?.message || 'Could not update profile.', true);
    } finally { setSaving(false); }
  };

  // ── Photo ────────────────────────────────────────────────────────────────
  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const updated = await userService.uploadPhoto(file);
      updateLocalUser(updated);
      flash('Photo updated.');
    } catch (err) {
      flash(err.response?.data?.message || 'Photo upload failed.', true);
    } finally { setUploadingPhoto(false); }
  };

  // ── Skills ───────────────────────────────────────────────────────────────
  const handleAddSkill = async (skillName, type) => {
    // Optimistic UI: add a temporary entry immediately so it appears at once
    const tempSkill = { id: null, skillName, type };
    setSkillsState(prev => ({ ...prev, [type]: [...prev[type], tempSkill] }));
    setAddingSkill(true);
    try {
      const updated = await userService.addSkill(skillName, type);
      updateLocalUser(updated);
      // Replace optimistic entry with confirmed server data
      setSkillsState({
        OFFER: updated.skills.filter(s => s.type === 'OFFER'),
        WANT:  updated.skills.filter(s => s.type === 'WANT'),
      });
    } catch (err) {
      // Rollback optimistic update
      setSkillsState(prev => ({
        ...prev,
        [type]: prev[type].filter(s => s !== tempSkill),
      }));
      flash(err.response?.data?.message || 'Could not add skill.', true);
    } finally { setAddingSkill(false); }
  };

  const handleRemoveSkill = async (index, type) => {
    const skill = skillsState[type][index];
    if (!skill?.id) return;
    // Optimistic UI: remove immediately so it disappears at once
    const prevSkills = skillsState[type];
    setSkillsState(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
    try {
      const updated = await userService.removeSkill(skill.id);
      updateLocalUser(updated);
      // Confirm with server-authoritative list
      setSkillsState({
        OFFER: updated.skills.filter(s => s.type === 'OFFER'),
        WANT:  updated.skills.filter(s => s.type === 'WANT'),
      });
    } catch (err) {
      // Rollback
      setSkillsState(prev => ({ ...prev, [type]: prevSkills }));
      flash(err.response?.data?.message || 'Could not remove skill.', true);
    }
  };

  // ── Projects ─────────────────────────────────────────────────────────────
  const addProject = () => {
    if (!newProject.title.trim()) return;
    const tags = newProject.tags.split(',').map(t => t.trim()).filter(Boolean);
    setProjects(p => [...p, { ...newProject, tags, url: newProject.url.trim() }]);
    setNewProject({ title: '', description: '', url: '', tags: '' });
    setAddingProject(false);
  };

  const removeProject = (idx) => setProjects(p => p.filter((_, i) => i !== idx));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 font-body dark:text-zinc-100">
      <div className="mb-8 border-b border-gray-200 pb-6 dark:border-zinc-800">
        <h1 className="flex items-center gap-3 font-display text-3xl font-bold text-gray-900 dark:text-white"><FaUserCircle className="text-orange-500" />Your profile</h1>
        <p className="mt-1 ml-2 text-md text-gray-500 dark:text-zinc-400 font-display font-medium">Update your details, links, projects and skills.</p>
      </div>

      {message && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-center gap-1.5 font-medium">
          <span>✓ {message}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* ── Photo ── */}
      <SectionCard title="Profile photo" icon={FaUserCircle}>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-give-bg text-give flex items-center justify-center overflow-hidden text-2xl font-bold border border-give/10 shrink-0">
            {user.profilePhotoUrl ? (
              <img 
                src={resolvePhotoUrl(API, user.profilePhotoUrl)} 
                alt={user.name}
                className="w-full h-full object-cover" 
              />
            ) : (
              user.name?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <button 
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading…</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span className="font-display">Change photo</span>
                </>
              )}
            </button>
            <p className="text-gray-400 text-[11px] font-medium font-display">JPG, PNG or GIF · max 5 MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
      </SectionCard>

      {/* ── Skills ── */}
      <SectionCard title="Skills" icon={FaGraduationCap}>
        <SkillTagInput
          label="Skills you can teach (Offer)"
          skills={skillsState.OFFER.map(s => s.skillName)}
          onAdd={handleAddSkill} onRemove={handleRemoveSkill}
          type="OFFER" placeholder="e.g. Excel, Yoga, Drawing…"
        />
        <SkillTagInput
          label="Skills you want to learn (Want)"
          skills={skillsState.WANT.map(s => s.skillName)}
          onAdd={handleAddSkill} onRemove={handleRemoveSkill}
          type="WANT" placeholder="e.g. Guitar, Python, Spanish…"
        />
        {addingSkill && <p className="text-xs text-gray-400 animate-pulse mt-2">Saving…</p>}
      </SectionCard>

      <form onSubmit={handleSubmit} className="profile-form space-y-4">
        {/* ── Basic info ── */}
        <SectionCard title="Basic info" icon={FaUser}>
          <div className="grid grid-cols-3 gap-4 font-sach">
            <div className="col-span-2 flex flex-col gap-1.5 mb-4">
              <label htmlFor="name" className="text-sm font-semibold text-gray-600">Name</label>
              <input id="name" required value={form.name} onChange={e => set('name', e.target.value)}
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors text-sm bg-gray-50" />
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label htmlFor="age" className="text-xs font-semibold text-gray-600">Age</label>
              <input id="age" type="number" min="0" value={form.age} onChange={e => set('age', e.target.value)}
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors text-sm bg-gray-50" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mb-4 font-sach">
            <label htmlFor="email" className="text-sm font-semibold text-gray-600">Email</label>
            <input id="email" type="email" required value={form.email} onChange={e => set('email', e.target.value)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors text-sm bg-gray-50" />
          </div>
          <div className="flex flex-col gap-1.5 mb-4 font-sach">
            <label htmlFor="password" className="text-sm font-semibold text-gray-600">New password</label>
            <input id="password" type="password" value={form.password}
              placeholder="Leave blank to keep current" onChange={e => set('password', e.target.value)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors text-sm bg-gray-50" />
          </div>
          <div className="flex flex-col gap-1.5 font-sach">
            <label htmlFor="bio" className="text-sm font-semibold text-gray-600">Bio</label>
            <textarea id="bio" rows={3} maxLength={500} value={form.bio}
              placeholder="Tell others about yourself…" onChange={e => set('bio', e.target.value)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors text-sm bg-gray-50" />
            <p className="text-[10px] text-gray-400 text-right mt-1 font-semibold">{form.bio.length}/500</p>
          </div>
        </SectionCard>

        {/* ── Social links ── */}
        <SectionCard title="Social & professional links" icon={FaGithub}>
          <p className="mb-6 text-sm font-medium font-sach text-gray-500 dark:text-zinc-400">
            These links are shown publicly on your profile so others can connect with you.
          </p>

          <div className="flex flex-col gap-1.5 mb-4 font-sach">
            <label htmlFor="github" className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
              <FaGithub className="h-4 w-4 text-gray-700 dark:text-zinc-300" />
              <span>GitHub URL</span>
            </label>
            <input id="github" type="url" value={form.githubUrl}
              placeholder="https://github.com/yourname"
              onChange={e => set('githubUrl', e.target.value)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50" />
          </div>

          <div className="flex flex-col gap-1.5 mb-4 font-sach">
            <label htmlFor="linkedin" className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
              <FaLinkedin className="h-4 w-4 text-blue-700" />
              <span>LinkedIn URL</span>
            </label>
            <input id="linkedin" type="url" value={form.linkedinUrl}
              placeholder="https://linkedin.com/in/yourname"
              onChange={e => set('linkedinUrl', e.target.value)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50" />
          </div>

          <div className="flex flex-col gap-1.5 mb-4 font-sach">
            <label htmlFor="website" className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
              <FaGlobe className="h-4 w-4 text-emerald-600" />
              <span>Personal website / portfolio</span>
            </label>
            <input id="website" type="url" value={form.websiteUrl}
              placeholder="https://yourportfolio.com"
              onChange={e => set('websiteUrl', e.target.value)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50" />
          </div>

          <div className="flex flex-col gap-1.5 font-sach">
            <label htmlFor="platforms" className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
              <FaGraduationCap className="h-4 w-4 text-purple-600" />
              <span>Learning platforms</span>
            </label>
            <input id="platforms" value={form.learningPlatforms}
              placeholder="https://coursera.org/in/you, https://udemy.com/user/you"
              onChange={e => set('learningPlatforms', e.target.value)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50" />
            <p className="text-[10px] text-gray-400 mt-1 font-semibold">
              Separate multiple links with commas (Coursera, Udemy, edX, freeCodeCamp…)
            </p>
          </div>
        </SectionCard>

        {/* ── Projects ── */}
        <SectionCard title="Projects" icon={FaFolderOpen}>
          <p className="mb-6 text-sm font-sach font-medium text-gray-500 dark:text-zinc-400">
            Showcase your work so others know what you've built.
          </p>

          {/* Existing projects */}
          <div className="space-y-3 mb-4">
            {projects.map((p, i) => (
              <div key={i} className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/70 dark:hover:border-emerald-700">
                <div className="flex justify-between items-start font-sach">
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="mb-1 text-base font-bold text-gray-900 dark:text-zinc-100">{p.title}</p>
                    {p.description && (
                      <p className="mb-3 text-sm leading-relaxed text-gray-500 dark:text-zinc-400">{p.description}</p>
                    )}
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold !text-emerald-700 transition-colors hover:!text-emerald-800 hover:underline dark:!text-emerald-400 dark:hover:!text-emerald-300">
                        <Link className="w-3.5 h-3.5" />
                        <span>{p.url.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                    {p.tags?.length > 0 && (
                      <div className="mt-4 border-t border-gray-100 pt-3 dark:border-zinc-800">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Tech stack</p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.tags.map(t => (
                            <span key={t} className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700 shadow-sm dark:border-emerald-900/80 dark:bg-emerald-100 dark:text-emerald-600">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => removeProject(i)}
                    aria-label={`Remove ${p.title}`}
                    className="rounded-full p-1.5 text-red-700 transition-all hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-400 dark:hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add project form */}
          {addingProject ? (
            <div className="border border-dashed border-gray-300 bg-gray-50/30 rounded-xl p-5 space-y-4 font-sach">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600">Project title *</label>
                <input value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. QuidProKnow Skill Exchange"
                  className="px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600">Short description</label>
                <textarea rows={2} value={newProject.description}
                  onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                  placeholder="What does this project do?"
                  className="px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600">Project URL</label>
                <input type="url" value={newProject.url}
                  onChange={e => setNewProject(p => ({ ...p, url: e.target.value }))}
                  placeholder="https://github.com/you/project"
                  className="px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600">Tech / tags</label>
                <input value={newProject.tags}
                  onChange={e => setNewProject(p => ({ ...p, tags: e.target.value }))}
                  placeholder="React, Spring Boot, MySQL"
                  className="px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-white" />
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">Comma-separated</p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button type="button" className="px-4 py-2 bg-give hover:brightness-110 text-white rounded-md text-xs font-semibold shadow-md shadow-give/5 transition-all disabled:opacity-50"
                  disabled={!newProject.title.trim()} onClick={addProject}>
                  Add project
                </button>
                <button type="button" className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-semibold transition-all"
                  onClick={() => { setAddingProject(false); setNewProject({ title: '', description: '', url: '', tags: '' }); }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              type="button" 
              className="inline-flex items-center gap-1 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold !font-sach transition-all"
              onClick={() => setAddingProject(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add project</span>
            </button>
          )}
        </SectionCard>

        <button 
          type="submit" 
          disabled={saving} 
          className="px-6 py-3 bg-give hover:brightness-110 text-white rounded-full !font-sach text-sm font-semibold shadow-lg shadow-give/15 transition-all mb-12"
        >
          {saving ? 'Saving…' : 'Save all changes'}
        </button>
      </form>
    </div>
  );
}
