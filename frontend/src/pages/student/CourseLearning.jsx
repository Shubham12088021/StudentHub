import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseService, lectureService, progressService } from '../../services/api';
import { CheckCircle, Circle, ChevronDown, ChevronUp, FileText, Play, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseLearning() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);
  const [lectureData, setLectureData] = useState(null);
  const [expandedSections, setExpandedSections] = useState([0]);
  const [tab, setTab] = useState('overview');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          courseService.getOne(courseId),
          progressService.get(courseId),
        ]);
        const c = courseRes.data.course;
        setCourse(c);
        setProgress(progressRes.data.progress);

        // Auto-select last watched or first lecture
        const lastLectureId = progressRes.data.progress?.lastWatched?.lecture?._id
          || progressRes.data.progress?.lastWatched?.lecture;
        const firstLecture = c.sections?.[0]?.lectures?.[0];

        if (lastLectureId) {
          selectLecture(lastLectureId);
        } else if (firstLecture?._id) {
          selectLecture(firstLecture._id);
        }
      } catch (err) {
        toast.error('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const selectLecture = async (lectureId) => {
    setActiveLecture(lectureId);
    try {
      const res = await lectureService.get(lectureId);
      setLectureData(res.data.lecture);
    } catch {
      toast.error('Failed to load lecture');
    }
  };

  const markComplete = async () => {
    if (!activeLecture) return;
    try {
      const res = await progressService.update(courseId, {
        lectureId: activeLecture,
        watchedDuration: 0,
        resumeTime: 0,
      });
      setProgress(res.data.progress);
      toast.success('Lecture marked as complete!');
      if (res.data.progress.isCompleted) {
        toast.success('🎉 Congratulations! Course completed! Certificate issued!', { duration: 5000 });
      }
    } catch {
      toast.error('Failed to update progress');
    }
  };

  const saveNote = async () => {
    if (!note.trim()) return;
    try {
      await progressService.addNote(courseId, {
        lectureId: activeLecture,
        content: note,
        timestamp: videoRef.current?.currentTime || 0,
      });
      toast.success('Note saved!');
      setNote('');
    } catch {
      toast.error('Failed to save note');
    }
  };

  const isCompleted = (lectureId) =>
    progress?.completedLectures?.some(l => l.lecture?._id === lectureId || l.lecture === lectureId);

  const toggleSection = (i) =>
    setExpandedSections(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  if (loading) return (
    <div className="flex h-full gap-0">
      <div className="flex-1 skeleton" />
      <div className="w-80 skeleton ml-4" />
    </div>
  );

  if (!course) return <div className="text-center py-20">Course not found</div>;

  const pct = progress?.progressPercentage || 0;

  return (
    <div className="flex flex-col lg:flex-row gap-0 -m-4 md:-m-6 h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Video Player */}
        <div className="bg-black aspect-video lg:aspect-auto lg:flex-1 relative">
          {lectureData?.video?.url ? (
            <video
              ref={videoRef}
              src={lectureData.video.url}
              controls
              className="w-full h-full object-contain"
              onEnded={markComplete}
            />
          ) : lectureData?.type === 'article' ? (
            <div className="w-full h-full flex items-center justify-center p-8 overflow-y-auto bg-white dark:bg-slate-900">
              <div className="max-w-2xl prose dark:prose-invert">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">{lectureData?.title}</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{lectureData?.content}</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              <div className="text-center">
                <Play size={48} className="mx-auto mb-3 opacity-30" />
                <p>Select a lecture to begin</p>
              </div>
            </div>
          )}
        </div>

        {/* Lecture Info Tabs */}
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex gap-0 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {['overview', 'notes', 'resources'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-medium capitalize flex-shrink-0 border-b-2 transition-colors ${tab === t ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="p-4 max-h-48 overflow-y-auto">
            {tab === 'overview' && (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">{lectureData?.title}</h2>
                    <p className="text-sm text-slate-500">{lectureData?.description}</p>
                  </div>
                  <button onClick={markComplete}
                    disabled={isCompleted(activeLecture)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isCompleted(activeLecture) ? 'bg-green-50 dark:bg-green-900/20 text-green-600 cursor-default' : 'btn-primary'}`}>
                    {isCompleted(activeLecture) ? <><CheckCircle size={15} /> Completed</> : <><Circle size={15} /> Mark Complete</>}
                  </button>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Course Progress</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            )}

            {tab === 'notes' && (
              <div>
                <div className="flex gap-2 mb-3">
                  <textarea value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Add a note about this lecture..."
                    className="input-field flex-1 h-16 resize-none text-sm" />
                  <button onClick={saveNote} disabled={!note.trim()} className="btn-primary px-4 text-sm disabled:opacity-50">
                    Save
                  </button>
                </div>
                {progress?.notes?.length > 0 ? (
                  <div className="space-y-2">
                    {progress.notes.slice(-3).reverse().map((n, i) => (
                      <div key={i} className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-sm">
                        <p className="text-slate-700 dark:text-slate-300">{n.content}</p>
                        {n.timestamp > 0 && <p className="text-xs text-slate-400 mt-1">@ {Math.floor(n.timestamp / 60)}:{String(n.timestamp % 60).padStart(2, '0')}</p>}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-400">No notes yet for this course.</p>}
              </div>
            )}

            {tab === 'resources' && (
              <div>
                {lectureData?.resources?.length > 0 ? (
                  <div className="space-y-2">
                    {lectureData.resources.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm text-primary-600">
                        <FileText size={16} /> {r.title}
                      </a>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-400">No resources for this lecture.</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Course Curriculum */}
      <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{course.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500">{progress?.completedLectures?.length || 0}/{course.totalLectures} completed</span>
            <span className="text-xs font-semibold text-primary-600">{pct}%</span>
          </div>
          <div className="progress-bar mt-2">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          {progress?.isCompleted && (
            <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 font-semibold">
                <Award size={16} /> Certificate ready!
              </div>
              <Link
                to={`/student/certificate/${courseId}`}
                className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-medium px-2.5 py-1 rounded-lg transition-colors"
              >
                View
              </Link>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.sections?.map((section, sIdx) => (
            <div key={sIdx} className="border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => toggleSection(sIdx)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate">{section.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {section.lectures?.filter(l => isCompleted(l._id)).length}/{section.lectures?.length} completed
                  </p>
                </div>
                {expandedSections.includes(sIdx) ? <ChevronUp size={15} className="text-slate-400 flex-shrink-0 ml-2" /> : <ChevronDown size={15} className="text-slate-400 flex-shrink-0 ml-2" />}
              </button>

              {expandedSections.includes(sIdx) && (
                <div>
                  {section.lectures?.map((lec) => (
                    <button
                      key={lec._id}
                      onClick={() => selectLecture(lec._id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${activeLecture === lec._id ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500' : ''}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isCompleted(lec._id)
                          ? <CheckCircle size={15} className="text-green-500" />
                          : activeLecture === lec._id
                            ? <Play size={15} className="text-primary-500" />
                            : <Circle size={15} className="text-slate-300" />
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-medium line-clamp-2 ${activeLecture === lec._id ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'}`}>
                          {lec.title}
                        </p>
                        {lec.duration > 0 && <p className="text-xs text-slate-400 mt-0.5">{lec.duration}m</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
