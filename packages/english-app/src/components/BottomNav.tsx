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
    <nav className="fixed bottom-0 left-0 right-0 border-t border-[#1f2d40] bg-[#0f172a] safe-area-inset-bottom">
      <div className="flex h-16 items-center justify-around sm:justify-center sm:gap-8">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-colors duration-200 ${
                isActive
                  ? 'text-[#10b981]'
                  : 'text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <Icon size={24} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
