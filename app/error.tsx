'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-black text-amber-500 mb-4">Algo deu errado</h1>
      <p className="text-slate-400 mb-6 max-w-md">
        Ocorreu um erro inesperado ao carregar esta página.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors"
        >
          Página inicial
        </Link>
      </div>
    </div>
  );
}
