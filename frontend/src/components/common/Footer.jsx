// Footer.jsx
import { GraduationCap, Twitter, Linkedin, Github, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">StudentHub</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              The modern online learning platform empowering students and instructors worldwide.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github, Youtube].map((Icon, i) => (
                <a key={i} href="/courses" className="w-9 h-9 bg-slate-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Platform', links: ['Browse Courses', 'Become Instructor', 'Pricing', 'Blog'] },
            { title: 'Categories', links: ['Web Development', 'Data Science', 'UI/UX Design', 'DevOps', 'Business'] },
            { title: 'Support', links: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h3 className="font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link}>
                    <a href="/courses" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} StudentHub. All rights reserved. Built with ❤️ for learners worldwide.
        </div>
      </div>
    </footer>
  );
}
