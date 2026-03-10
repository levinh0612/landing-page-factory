import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex h-screen bg-[#0f172a]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto md:ml-64">
        <div className="p-3 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
