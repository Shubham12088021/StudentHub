import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService, lectureService } from '../../services/api';
import { CATEGORIES, LEVELS } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Plus, Trash2, ChevronDown, ChevronUp, Upload, Save, Video, FileText } from 'lucide-react';

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState([]);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingLecture, setAddingLecture] = useState(null); // { sectionIndex, form }
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);

  useEffect(() => {
    courseService.getOne(id)
      .then(res => {
        setCourse(res.data.course);
        setThumbPreview(res.data.course.thumbnail?.url);
        setExpandedSections(res.data.course.sections?.map((_, i) => i) || []);
      })
      .catch(() => navigate('/instructor/courses')) // eslint-disable-line react-hooks/exhaustive-deps
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    ['title', 'description', 'shortDescription', 'category', 'level', 'language', 'price', 'discountPrice'].forEach(k => {
      if (course[k] !== undefined) fd.append(k, course[k]);
    });
    ['requirements', 'whatYouLearn', 'targetAudience', 'tags'].forEach(k => {
      if (course[k]) fd.append(k, JSON.stringify(course[k]));
    });
    if (thumbnail) fd.append('thumbnail', thumbnail);

    try {
      const res = await courseService.update(id, fd);
      setCourse(res.data.course);
      toast.success('Course saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    try {
      const res = await courseService.addSection(id, { title: newSectionTitle, description: '' });
      setCourse(res.data.course);
      setNewSectionTitle('');
      setAddingSection(false);
      toast.success('Section added!');
    } catch { toast.error('Failed to add section'); }
  };

  const handleAddLecture = async (sectionIndex) => {
    const form = addingLecture?.form;
    if (!form?.title) { toast.error('Enter lecture title'); return; }

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('type', form.type || 'video');
    fd.append('isFree', form.isFree || false);
    if (form.notes) fd.append('notes', form.notes);
    if (form.videoFile) fd.append('video', form.videoFile);

    try {
      await lectureService.add(id, sectionIndex, fd);
      // Reload course to get updated sections
      const courseRes = await courseService.getOne(id);
      setCourse(courseRes.data.course);
      setAddingLecture(null);
      toast.success('Lecture added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add lecture');
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    if (!window.confirm('Delete this lecture?')) return;
    try {
      await lectureService.delete(lectureId);
      const courseRes = await courseService.getOne(id);
      setCourse(courseRes.data.course);
      toast.success('Lecture deleted');
    } catch { toast.error('Failed to delete lecture'); }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>;
  if (!course) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Edit Course</h1>
        <div className="flex gap-3">
          <button onClick={() => navigate('/instructor/courses')} className="btn-secondary text-sm py-2">← Back</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-1 space-y-5">
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Thumbnail</h3>
            <label className="cursor-pointer block">
              <div className="aspect-video rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary-400 transition-colors">
                {thumbPreview
                  ? <img src={thumbPreview} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex flex-col items-center justify-center"><Upload size={24} className="text-slate-400 mb-2" /><p className="text-xs text-slate-400">Upload thumbnail</p></div>}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (f) { setThumbnail(f); setThumbPreview(URL.createObjectURL(f)); } }} />
            </label>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Basic Info</h3>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Title</label>
              <input className="input-field text-sm" value={course.title || ''} onChange={e => setCourse({ ...course, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Category</label>
              <select className="input-field text-sm" value={course.category || ''} onChange={e => setCourse({ ...course, category: e.target.value })}>
                <option value="">Select</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Level</label>
              <select className="input-field text-sm" value={course.level || ''} onChange={e => setCourse({ ...course, level: e.target.value })}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Price (₹)</label>
                <input type="number" className="input-field text-sm" value={course.price || ''} onChange={e => setCourse({ ...course, price: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Sale Price</label>
                <input type="number" className="input-field text-sm" value={course.discountPrice || ''} onChange={e => setCourse({ ...course, discountPrice: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Status</label>
              <span className={`badge text-xs ${course.status === 'published' ? 'bg-green-100 text-green-700' : course.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                {course.status}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Curriculum */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Course Curriculum</h3>
              <button onClick={() => setAddingSection(true)} className="btn-primary text-sm py-1.5 flex items-center gap-1.5">
                <Plus size={14} /> Add Section
              </button>
            </div>

            {/* Add Section Form */}
            {addingSection && (
              <div className="mb-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex gap-3">
                <input className="input-field text-sm flex-1" value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)}
                  placeholder="Section title" onKeyDown={e => e.key === 'Enter' && handleAddSection()} autoFocus />
                <button onClick={handleAddSection} className="btn-primary text-sm px-4">Add</button>
                <button onClick={() => setAddingSection(false)} className="btn-secondary text-sm px-3">Cancel</button>
              </div>
            )}

            {course.sections?.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">
                No sections yet. Add a section to start building your curriculum.
              </div>
            )}

            <div className="space-y-3">
              {course.sections?.map((section, sIdx) => (
                <div key={sIdx} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  {/* Section header */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800">
                    <button onClick={() => setExpandedSections(prev => prev.includes(sIdx) ? prev.filter(x => x !== sIdx) : [...prev, sIdx])}>
                      {expandedSections.includes(sIdx) ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                    </button>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{section.title}</p>
                      <p className="text-xs text-slate-400">{section.lectures?.length || 0} lectures</p>
                    </div>
                    <button
                      onClick={() => setAddingLecture({ sectionIndex: sIdx, form: { title: '', type: 'video', isFree: false, notes: '' } })}
                      className="text-xs text-primary-600 flex items-center gap-1 hover:underline"
                    >
                      <Plus size={12} /> Add Lecture
                    </button>
                  </div>

                  {/* Add lecture form */}
                  {addingLecture?.sectionIndex === sIdx && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">New Lecture</p>
                      <div className="space-y-3">
                        <input className="input-field text-sm" placeholder="Lecture title *" value={addingLecture.form.title}
                          onChange={e => setAddingLecture({ ...addingLecture, form: { ...addingLecture.form, title: e.target.value } })} />
                        <div className="flex gap-3">
                          <select className="input-field text-sm flex-1" value={addingLecture.form.type}
                            onChange={e => setAddingLecture({ ...addingLecture, form: { ...addingLecture.form, type: e.target.value } })}>
                            <option value="video">Video</option>
                            <option value="article">Article</option>
                            <option value="pdf">PDF</option>
                          </select>
                          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <input type="checkbox" checked={addingLecture.form.isFree}
                              onChange={e => setAddingLecture({ ...addingLecture, form: { ...addingLecture.form, isFree: e.target.checked } })} />
                            Free preview
                          </label>
                        </div>
                        {addingLecture.form.type === 'video' && (
                          <label className="flex items-center gap-2 text-sm text-primary-600 cursor-pointer">
                            <Video size={15} />
                            {addingLecture.form.videoFile ? addingLecture.form.videoFile.name : 'Upload video (optional)'}
                            <input type="file" accept="video/*" className="hidden" onChange={e => {
                              const f = e.target.files[0];
                              if (f) setAddingLecture({ ...addingLecture, form: { ...addingLecture.form, videoFile: f } });
                            }} />
                          </label>
                        )}
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => handleAddLecture(sIdx)} className="btn-primary text-sm py-1.5 px-4">Add Lecture</button>
                          <button onClick={() => setAddingLecture(null)} className="btn-secondary text-sm py-1.5 px-4">Cancel</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lectures list */}
                  {expandedSections.includes(sIdx) && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {section.lectures?.length === 0 ? (
                        <p className="text-xs text-slate-400 p-4 text-center">No lectures yet. Add your first lecture.</p>
                      ) : (
                        section.lectures?.map((lec, lIdx) => (
                          <div key={lec._id || lIdx} className="flex items-center gap-3 px-5 py-3">
                            {lec.type === 'video' ? <Video size={14} className="text-blue-500 flex-shrink-0" /> : <FileText size={14} className="text-green-500 flex-shrink-0" />}
                            <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{lec.title}</span>
                            {lec.isFree && <span className="badge bg-green-50 text-green-600 text-xs">Free</span>}
                            <button onClick={() => handleDeleteLecture(lec._id)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
