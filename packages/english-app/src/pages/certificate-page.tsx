import { useState } from 'react';
import { useProgress } from '@/hooks/useProgress';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Download, Lock } from 'lucide-react';

export const CertificatePage = () => {
  const { getProgress } = useProgress();
  const progress = getProgress();
  const [studentName, setStudentName] = useState(progress.userName);
  const [showCertificate, setShowCertificate] = useState(true);

  const isEligible = progress.completedLessons.length >= 6; // At least Phase 1
  const isFullyComplete = progress.completedLessons.length === 24;

  const getCertificatePhase = () => {
    if (progress.completedLessons.length >= 24) return 4;
    if (progress.completedLessons.length >= 18) return 3;
    if (progress.completedLessons.length >= 12) return 2;
    if (progress.completedLessons.length >= 6) return 1;
    return 0;
  };

  const getPhaseTitle = (phase: number) => {
    const titles = [
      '',
      'Foundations',
      'Workplace English',
      'Technical Discussion',
      'Professional Fluency',
    ];
    return titles[phase] || '';
  };

  const handleDownload = () => {
    // Simple print-to-PDF functionality
    window.print();
  };

  const certificatePhase = getCertificatePhase();

  if (!isEligible) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
          <div className="text-6xl">🔒</div>
          <h1 className="text-4xl font-bold text-[#f1f5f9] text-center">Certificate Locked</h1>
          <p className="text-[#94a3b8] text-center max-w-md">
            Complete at least Phase 1 (6 lessons) to unlock your certificate.
          </p>

          <Card className="w-full max-w-md p-6">
            <h3 className="font-semibold text-[#f1f5f9] mb-4">Progress to Phase 1</h3>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[#cbd5e1]">Lessons Completed</span>
                <span className="text-sm font-semibold text-[#f1f5f9]">
                  {progress.completedLessons.length} / 6
                </span>
              </div>
              <div className="h-3 bg-[#334155] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] transition-all duration-300"
                  style={{ width: `${(progress.completedLessons.length / 6) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-[#94a3b8] text-center">
              {6 - progress.completedLessons.length} more lessons to go!
            </p>
          </Card>

          <Button onClick={() => (window.location.href = '/lessons')}>
            Continue Learning
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#f1f5f9] mb-2">🎓 Your Certificate</h1>
        <p className="text-[#94a3b8]">
          Congratulations on completing{' '}
          <Badge variant="success">{getPhaseTitle(certificatePhase)}</Badge>
        </p>
      </div>

      {/* Edit Name Section */}
      <Card className="p-6">
        <h3 className="font-semibold text-[#f1f5f9] mb-4">Certificate Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
              Your Name (as shown on certificate)
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-[#0f172a] text-[#f1f5f9] placeholder-[#64748b] rounded-lg px-4 py-2 border border-[#475569] focus:outline-none focus:border-[#10b981]"
              placeholder="Enter your name"
            />
          </div>
        </div>
      </Card>

      {/* Certificate Preview */}
      <div className="print:bg-white print:text-black">
        <Card className="p-8 sm:p-12 text-center border-4 border-[#f59e0b]/30 bg-gradient-to-br from-[#1e3a8a]/5 to-[#f59e0b]/5">
          {/* Certificate Header */}
          <div className="mb-8">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#f59e0b] mb-2">
              Certificate of Achievement
            </h2>
            <p className="text-[#94a3b8] print:text-black/70">English Fluent</p>
          </div>

          {/* Certificate Body */}
          <div className="space-y-8 py-8 border-y border-[#f59e0b]/30">
            <p className="text-[#cbd5e1] print:text-black/80">This is to certify that</p>

            <h3 className="text-4xl sm:text-5xl font-bold text-[#34d399] print:text-blue-600">
              {studentName}
            </h3>

            <div className="space-y-2">
              <p className="text-[#cbd5e1] print:text-black/80">
                has successfully completed the English for Tech course
              </p>
              <p className="text-2xl font-semibold text-[#f1f5f9] print:text-black">
                {getPhaseTitle(certificatePhase)} Phase
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[#94a3b8] print:text-black/70">
                {progress.completedLessons.length} Lessons Completed
              </p>
              <p className="text-[#94a3b8] print:text-black/70">
                {Math.round((progress.completedLessons.length / 24) * 100)}% Progress
              </p>
              <p className="text-[#94a3b8] print:text-black/70">
                {progress.xp} XP Earned
              </p>
            </div>
          </div>

          {/* Certificate Footer */}
          <div className="mt-8 space-y-4">
            <p className="text-[#94a3b8] print:text-black/70 text-sm">
              Issued on {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            {isFullyComplete && (
              <Badge variant="accent" className="justify-center mx-auto">
                ⭐ MASTERED - Complete Fluency Achievement
              </Badge>
            )}

            <div className="pt-4 space-y-1">
              <p className="text-[#f59e0b] font-semibold print:text-blue-600">English Fluent</p>
              <p className="text-xs text-[#94a3b8] print:text-black/70">
                Tech Workplace Communication Academy
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center print:hidden">
        <Button variant="secondary" onClick={handleDownload} className="flex items-center gap-2">
          <Download size={18} /> Print / Download
        </Button>

        {!isFullyComplete && (
          <Button
            variant="primary"
            onClick={() => (window.location.href = '/roadmap')}
          >
            Continue to Phase {certificatePhase + 1}
          </Button>
        )}
      </div>

      {/* Achievements */}
      {isFullyComplete && (
        <Card className="p-6 bg-gradient-to-br from-[#f59e0b]/20 to-[#10b981]/10 border-[#f59e0b]/30">
          <h3 className="text-lg font-semibold text-[#f1f5f9] mb-4">🌟 Master Achievement Unlocked</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <p className="font-medium text-[#f1f5f9]">Total Words Mastered</p>
                <p className="text-sm text-[#94a3b8]">192 technical vocabulary words</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-medium text-[#f1f5f9]">Consistency</p>
                <p className="text-sm text-[#94a3b8]">Maintained a study streak throughout</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="font-medium text-[#f1f5f9]">Fluency Reached</p>
                <p className="text-sm text-[#94a3b8]">Level 7 - Professional Fluency</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Share Section */}
      <Card className="p-6 text-center">
        <h3 className="font-semibold text-[#f1f5f9] mb-3">Share Your Achievement</h3>
        <p className="text-[#94a3b8] text-sm mb-4">
          You can share your certificate with potential employers
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm">
            LinkedIn
          </Button>
          <Button variant="secondary" size="sm">
            Twitter
          </Button>
          <Button variant="secondary" size="sm">
            Email
          </Button>
        </div>
      </Card>
    </div>
  );
};
