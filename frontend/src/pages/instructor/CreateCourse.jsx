import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../../services/api';
import { CATEGORIES, LEVELS } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Upload, Plus, X, BookOpen } from 'lucide-react';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', shortDescription: '',
    category: '', level: 'All Levels', language: 'English',
    price: '', discountPrice: '',
    requirements: [''], whatYouLearn: [''], targetAudience: [''], tags: '',
  });

  const handleThumb = (e) => {
    const file = e.target.files[0];
    if (file) { setThumbnail(file); setThumbPreview(URL.createObjectURL(file)); }
  };

  const addItem = (field) => setForm(p => ({ ...p, [field]: [...p[field], ''] }));
  const updateItem = (field, idx, val) => setForm(p => ({ ...p, [field]: p[field].map((x, i) => i === idx ? val : x) }));
  const removeItem = (field, idx) => setForm(p => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) {
      toast.error('Please fill all required fields'); return;
    }
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (Array.isArray(v)) fd.append(k, JSON.stringify(v.filter(Boolean)));
      else if (v) fd.append(k, v);
    });
    if (thumbnail) fd.append('thumbnail', thumbnail);

    try {
      const res = await courseService.create(fd);
      toast.success('Course created! Now add sections and lectures.');
      navigate(`/instructor/courses/${res.data.course._id}/edit`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally { setLoading(false); }
  };

  const DynamicList = ({ field, label, placeholder }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <button type="button" onClick={() => addItem(field)} className="text-xs text-primary-600 flex items-center gap-1 hover:underline">
          <Plus size={12} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {form[field].map((item, i) => (
          <div key={i} className="flex gap-2">
            <input className="input-field text-sm flex-1" value={item} onChange={e => updateItem(field, i, e.target.value)} placeholder={`${placeholder} ${i + 1}`} />
            {form[field].length > 1 && (
              <button type="button" onClick={() => removeItem(field, i)} className="text-red-400 hover:text-red-600 p-1">
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BookOpen size={24} className="text-primary-600" />
        <h1 className="section-title">Create New Course</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="card p-6">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Course Title <span className="text-red-500">*</span></label>
                  <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Complete React.js Bootcamp 2024" maxLength={120} />
                  <p className="text-xs text-slate-400 mt-1">{form.title.length}/120</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Short Description</label>
                  <input className="input-field" value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })}
                    placeholder="Brief summary (max 200 chars)" maxLength={200} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Full Description <span className="text-red-500">*</span></label>
                  <textarea className="input-field h-32 resize-none" value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your course in detail — what students will learn, who it's for, etc." />
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="card p-6">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Course Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Level</label>
                  <select className="input-field" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Price (₹)</label>
                  <input type="number" min="0" className="input-field" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0 for free" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Discount Price (₹)</label>
                  <input type="number" min="0" className="input-field" value={form.discountPrice}
                    onChange={e => setForm({ ...form, discountPrice: e.target.value })} placeholder="Optional" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Language</label>
                  <input className="input-field" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} placeholder="English" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Tags (comma-separated)</label>
                  <input className="input-field" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="react, javascript, web development" />
                </div>
              </div>
            </div>

            {/* Learning outcomes */}
            <div className="card p-6 space-y-5">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">Learning Outcomes</h2>
              <DynamicList field="whatYouLearn" label="What Students Will Learn" placeholder="Students will be able to..." />
              <DynamicList field="requirements" label="Requirements" placeholder="Requirement" />
              <DynamicList field="targetAudience" label="Target Audience" placeholder="This course is for..." />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Thumbnail */}
            <div className="card p-5">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">Course Thumbnail</h3>
              <label className="block cursor-pointer">
                {thumbPreview ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video">
                    <img src={thumbPreview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm">Change image</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center hover:border-primary-400 transition-colors">
                    <Upload size={28} className="text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">Click to upload thumbnail</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleThumb} />
              </label>
            </div>

            {/* Submit */}
            <div className="card p-5">
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mb-3">
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</span> : 'Create Course'}
              </button>
              <p className="text-xs text-slate-400 text-center">You can add lectures and sections after creation</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
