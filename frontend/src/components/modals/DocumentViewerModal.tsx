import React, { useState, useEffect } from 'react';
import { FileText, Download, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { admissionService } from '../../services/admissionService';
import { toast } from 'sonner';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number | null;
  documentName: string;
  contentType?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentName,
  contentType: initialContentType,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>(initialContentType || 'application/pdf');

  useEffect(() => {
    if (!isOpen || !documentId) {
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setError(null);
      return;
    }

    let active = true;
    let createdUrl: string | null = null;

    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        const { blobUrl: url, contentType } = await admissionService.previewDocumentBlob(documentId);
        if (active) {
          createdUrl = url;
          setBlobUrl(url);
          setMimeType(contentType || initialContentType || 'application/pdf');
        } else {
          URL.revokeObjectURL(url);
        }
      } catch (err: any) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load document preview.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDocument();

    // Memory Cleanup on close/unmount
    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, documentId]);

  if (!isOpen || !documentId) return null;

  const handleDownload = async () => {
    try {
      await admissionService.downloadDocumentBlob(documentId, documentName);
      toast.success('Document download started.');
    } catch {
      toast.error('Failed to download document.');
    }
  };

  const isImage = mimeType.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(documentName);
  const isPdf = mimeType.includes('pdf') || /\.pdf$/i.test(documentName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 sm:p-6 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[88vh] text-slate-100">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-tight">{documentName}</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {isImage ? 'IMAGE DOCUMENT' : isPdf ? 'PDF DOCUMENT' : 'DIGITAL FILE'} · Secured Preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Original</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-slate-950 p-4 sm:p-6 flex items-center justify-center overflow-auto relative">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-12">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-300">Decrypting &amp; preparing document preview...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white">Preview Unavailable</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  admissionService
                    .previewDocumentBlob(documentId)
                    .then(({ blobUrl: url, contentType }) => {
                      setBlobUrl(url);
                      setMimeType(contentType);
                    })
                    .catch((err) => setError(err.response?.data?.message || 'Failed to load preview.'))
                    .finally(() => setLoading(false));
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Loading</span>
              </button>
            </div>
          )}

          {!loading && !error && blobUrl && (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              {isImage ? (
                <img
                  src={blobUrl}
                  alt={documentName}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
                />
              ) : (
                <object
                  data={blobUrl}
                  type="application/pdf"
                  className="w-full h-full rounded-xl border border-slate-800 bg-white"
                >
                  <embed
                    src={blobUrl}
                    type="application/pdf"
                    className="w-full h-full rounded-xl"
                  />
                  <div className="p-8 text-center text-xs text-slate-400 space-y-3">
                    <p>PDF inline rendering is not supported by your browser viewer.</p>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl"
                    >
                      Download PDF File
                    </button>
                  </div>
                </object>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
