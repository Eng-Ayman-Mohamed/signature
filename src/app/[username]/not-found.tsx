import Link from 'next/link';

export default function PortfolioNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Portfolio Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
          The portfolio you&apos;re looking for doesn&apos;t exist or hasn&apos;t been published yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
        >
          Go to Portfolio Generator
        </Link>
      </div>
    </div>
  );
}
