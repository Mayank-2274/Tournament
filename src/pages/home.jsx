import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight, Activity } from 'lucide-react';

export default function Home() {
    const [tournamentId, setTournamentId] = useState('');
    const navigate = useNavigate();

    const handleJoin = (e) => {
        e.preventDefault();
        if (tournamentId.trim()) {
            navigate(`/tournaments/${tournamentId.trim().toUpperCase()}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center mb-12">
                <Trophy className="w-24 h-24 text-espn-red mx-auto mb-6" />
                <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
                    LIVE TOURNAMENT TRACKER
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                   Specially designed for CORE CODm Paglus by Mayank Malviya
                </p>
            </div>

            <div className="w-full max-w-md bg-espn-card p-8 rounded-xl shadow-2xl border border-gray-800">
                <h2 className="text-2xl font-bold mb-6 flex items-center justify-center">
                    <Activity className="w-6 h-6 mr-2 text-espn-red" />
                    Join Live Tournament
                </h2>

                <form onSubmit={handleJoin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Tournament ID
                        </label>
                        <input
                            type="text"
                            value={tournamentId}
                            onChange={(e) => setTournamentId(e.target.value)}
                            placeholder="e.g. TRN-42X"
                            className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-espn-red focus:ring-1 focus:ring-espn-red uppercase"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-espn-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center group"
                    >
                        Access Dashboard
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                    <p className="text-sm text-gray-400 mb-4">Want to host your own tournament?</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="text-espn-red hover:text-white font-semibold transition-colors"
                    >
                        Admin Login &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
}
