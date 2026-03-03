import { Trophy } from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function PlayoffsBracket({ tournamentId, playoffs, isAdmin }) {
    if (!playoffs) return null;

    const handleMarkWinner = async (matchKey, winnerStr, loserStr) => {
        if (!isAdmin) return;

        const newPlayoffs = { ...playoffs };
        const match = newPlayoffs[matchKey];
        match.status = 'completed';
        match.winnerId = winnerStr;
        match.loserId = loserStr;

        // Progression logic
        if (matchKey === 'qualifier1') {
            newPlayoffs.final.team1Id = winnerStr;
            newPlayoffs.qualifier2.team1Id = loserStr;
        } else if (matchKey === 'eliminator') {
            newPlayoffs.qualifier2.team2Id = winnerStr;
        } else if (matchKey === 'qualifier2') {
            newPlayoffs.final.team2Id = winnerStr;
        } else if (matchKey === 'final') {
            newPlayoffs.champion = winnerStr;
        }

        try {
            await updateDoc(doc(db, 'tournaments', tournamentId), {
                playoffs: newPlayoffs
            });
        } catch (e) {
            console.error(e);
            alert('Failed to update playoff match');
        }
    };

    const MatchBox = ({ matchKey, match }) => (
        <div className="bg-[#1e1e1e] border border-gray-700 rounded-lg p-4 shadow-lg flex flex-col justify-center relative w-64 m-2">
            <div className="text-xs text-espn-red font-bold uppercase mb-2 text-center tracking-widest">{match.name}</div>
            <div className="flex justify-between items-center mb-2 px-2 py-1 bg-[#121212] rounded">
                <span className={`truncate w-32 font-semibold ${match.winnerId === match.team1Id ? 'text-green-500' : 'text-gray-300'}`}>{match.team1Id}</span>
                {isAdmin && match.status === 'pending' && !match.team1Id.includes('Winner') && !match.team1Id.includes('Loser') && (
                    <button onClick={() => handleMarkWinner(matchKey, match.team1Id, match.team2Id)} className="text-xs bg-espn-red hover:bg-red-700 text-white px-2 py-1 rounded">Win</button>
                )}
            </div>
            <div className="flex justify-between items-center px-2 py-1 bg-[#121212] rounded">
                <span className={`truncate w-32 font-semibold ${match.winnerId === match.team2Id ? 'text-green-500' : 'text-gray-300'}`}>{match.team2Id}</span>
                {isAdmin && match.status === 'pending' && !match.team2Id.includes('Winner') && !match.team2Id.includes('Loser') && (
                    <button onClick={() => handleMarkWinner(matchKey, match.team2Id, match.team1Id)} className="text-xs bg-espn-red hover:bg-red-700 text-white px-2 py-1 rounded">Win</button>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-espn-dark pt-8 pb-12 overflow-x-auto w-full">
            <div className="flex flex-col items-center min-w-max px-4">
                {playoffs.champion && (
                    <div className="bg-yellow-500/10 border border-yellow-500/50 p-6 rounded-2xl mb-12 text-center animate-pulse">
                        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <div className="text-yellow-500 text-sm font-bold uppercase tracking-widest mb-1">Champions</div>
                        <div className="text-4xl font-extrabold text-white">{playoffs.champion}</div>
                    </div>
                )}

                <div className="flex space-x-12 items-center">
                    {/* Column 1: Q1 and Eliminator */}
                    <div className="flex flex-col space-y-16">
                        <MatchBox matchKey="qualifier1" match={playoffs.qualifier1} />
                        <MatchBox matchKey="eliminator" match={playoffs.eliminator} />
                    </div>

                    {/* Column 2: Q2 (in middle vertical) */}
                    <div className="flex flex-col justify-center">
                        <MatchBox matchKey="qualifier2" match={playoffs.qualifier2} />
                    </div>

                    {/* Column 3: Final */}
                    <div className="flex flex-col justify-center">
                        <MatchBox matchKey="final" match={playoffs.final} />
                    </div>
                </div>
            </div>
        </div>
    );
}
