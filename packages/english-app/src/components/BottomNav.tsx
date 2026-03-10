import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, RotateCcw, MessageCircle, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Trang Chủ', icon: Home },
  { path: '/learn', label: 'Học', icon: BookOpen },
  { path: '/review', label: 'Ôn Tập', icon: RotateCcw },
  { path: '/chat', label: 'Chat', icon: MessageCircle },
  { path: '/profile', label: 'Tôi', icon: User },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1f2d40] bg-[#0f172a]/95 backdrop-blur-sm safe-area-inset-bottom">
      <div className="flex h-16 items-center justify-around">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 text-[11px] font-medium transition-all duration-200 ${
                isActive
                  ? 'text-[#10b981]'
                  : 'text-[#64748b] active:text-[#f1f5f9]'
              }`}
              style={{ minHeight: '52px', minWidth: '52px' }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
