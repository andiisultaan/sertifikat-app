'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { sertifikatService } from '@/services/api/sertifikatService';

export default function PrintSertifikatPage() {
  const { id } = useParams<{ id: string }>();
  const [pdfUrl, setPdfUrl]     = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPdf = async () => {
      try {
        const token = localStorage.getItem('token');
        const url   = sertifikatService.downloadUrl(Number(id));

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          setError(json.message ?? 'Gagal memuat PDF.');
          return;
        }

        const blob    = await res.blob();
        const objUrl  = URL.createObjectURL(blob);
        setPdfUrl(objUrl);
      } catch {
        setError('Terjadi kesalahan saat memuat PDF.');
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-500 text-sm">
        Memuat PDF sertifikat...
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 gap-3">
        <p className="text-red-500 text-sm">{error ?? 'PDF tidak tersedia.'}</p>
        <button
          onClick={() => window.close()}
          className="text-sm px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Tutup
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-800">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white shrink-0">
        <span className="text-sm font-medium">Sertifikat UKK</span>
        <div className="flex gap-2">
          <a
            href={pdfUrl}
            download={`Sertifikat-${id}.pdf`}
            className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Download PDF
          </a>
          <button
            onClick={() => window.close()}
            className="text-sm px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <iframe
        src={`${pdfUrl}#toolbar=1&navpanes=0`}
        className="flex-1 w-full border-0"
        title="Sertifikat PDF"
      />
    </div>
  );
}
