import { Download, QrCode } from 'lucide-react';

interface QRCodeCardProps {
  slug: string;
}

const QRCodeCard = ({ slug }: QRCodeCardProps) => {
  const profileUrl = `${window.location.origin}/u/${slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}`;

  const handleDownload = async () => {
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${slug}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <QrCode size={16} className="text-primary" />
        Código QR
      </div>
      <img src={qrUrl} alt="QR Code" className="w-36 h-36 rounded-md" />
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 text-xs text-primary hover:underline"
      >
        <Download size={14} /> Descargar QR
      </button>
    </div>
  );
};

export default QRCodeCard;
