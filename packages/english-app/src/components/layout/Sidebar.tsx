import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  Home,
  Map,
  BookOpen,
  Gamepad2,
  MessageCircle,
  BarChart3,
  Trophy,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Map, label: 'Roadmap', path: '/roadmap' },
  { icon: BookOpen, label: 'Lessons', path: '/lessons' },
  { icon: Gamepad2, label: 'Games', path: '/games' },
  { icon: MessageCircle, label: 'AI Chat', path: '/chat' },
  { icon: BarChart3, label: 'Progress', path: '/progress' },
  { icon: Trophy, label: 'Certificate', path: '/certificate' },
];

export const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-[#1e293b] border border-[#475569] md:hidden text-[#f1f5f9] hover:bg-[#334155]"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 h-screen w-64 bg-[#0f172a] border-r border-[#475569] overflow-y-auto transition-transform duration-300 z-30',
          !isOpen && '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 mt-4 md:mt-0">
            <div className="text-2xl">🇬🇧</div>
            <div>
              <h1 className="text-xl font-bold text-[#f1f5f9]">English</h1>
              <p className="text-xs text-[#94a3b8]">Fluent</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30'
                      : 'text-[#cbd5e1] hover:bg-[#334155]',
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
