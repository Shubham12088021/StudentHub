import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Award, Download, ArrowLeft } from 'lucide-react';

export default function Certificate() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => window.print();

  return (
    <div>
      {/* Print controls - hidden on print */}
      <div className="flex gap-3 mb-6 print:hidden">
        <Link to="/student/my-courses" className="btn-secondary flex items-center gap-2 text-sm py-2">
          <ArrowLeft size={15} /> Back to Courses
        </Link>
        <button onClick={handlePrint} className="btn-primary flex items-center gap-2 text-sm py-2">
          <Download size={15} /> Download / Print
        </button>
      </div>

      {/* Certificate */}
      <div
        id="certificate"
        className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border-8 border-primary-600"
        style={{ aspectRatio: '1.414/1', position: 'relative' }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary-600 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-600 rounded-full translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative flex flex-col items-center justify-center h-full p-10 text-center">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center">
              <Award size={24} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-slate-800">StudentHub</span>
          </div>

          <p className="text-sm font-semibold uppercase tracking-widest text-primary-600 mb-4">
            Certificate of Completion
          </p>

          <p className="text-slate-500 mb-3">This is to certify that</p>

          <h1 className="text-4xl font-bold font-display text-slate-900 mb-3 border-b-2 border-primary-200 pb-3 px-8">
            {user?.name}
          </h1>

          <p className="text-slate-500 mb-2">has successfully completed the course</p>

          <h2 className="text-xl font-bold text-slate-800 mb-6 max-w-lg">
            Course Title Here
          </h2>

          <div className="flex items-center gap-8 text-sm text-slate-500">
            <div className="text-center">
              <p className="font-bold text-slate-700">Date Issued</p>
              <p>{date}</p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <p className="font-bold text-slate-700">Certificate ID</p>
              <p className="font-mono text-xs">{user?._id?.slice(-8)?.toUpperCase()}-{courseId?.slice(-6)?.toUpperCase()}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
            <Award size={16} /> Verified Certificate
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; }
          #certificate { border-radius: 0 !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
