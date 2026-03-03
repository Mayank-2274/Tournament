import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ShareButton({ tournamentId }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        // Generate viewer link, not admin link
        const link = `${window.location.origin}/tournaments/${tournamentId}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center text-sm bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors border border-gray-600"
        >
            {copied ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Share2 className="w-4 h-4 mr-2" />}
            {copied ? 'Copied Link!' : 'Share Viewer Link'}
        </button>
    );
}
