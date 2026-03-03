import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CheckCircle, RotateCcw, ChevronUp, ChevronDown, Swords, Trophy, Clock } from 'lucide-react';

export default function Fixtures({ tournamentId, fixtures, teams, isAdmin, pointsTable }) {
    if (!fixtures || fixtures.length === 0) {
        return (
            <div className="bg-espn-card p-8 rounded-xl border border-gray-800 text-center text-gray-500">
                No fixtures available.
            </div>
        );
    }

    const getTeamName = (id) => {
        if (id === 'BYE') return 'BYE';
        const t = teams.find(t => t.id === id);
        return t ? t.name : 'Unknown';
    };

    const completedCount = fixtures.filter(f => f.status === 'completed').length;
    const totalCount = fixtures.length;

    const markWinner = async (matchId, winnerId, loserId, isTie = false) => {
        if (!isAdmin) return;

        const newFixtures = fixtures.map(f => {
            if (f.id === matchId) {
                return { ...f, status: 'completed', winnerId: isTie ? 'TIE' : winnerId };
            }
            return f;
        });

        const pt = { ...pointsTable };

        if (!isTie) {
            if (pt[winnerId]) {
                pt[winnerId].played += 1;
                pt[winnerId].won += 1;
                pt[winnerId].points += 2;
            }
            if (pt[loserId]) {
                pt[loserId].played += 1;
                pt[loserId].lost += 1;
            }
        } else {
            if (pt[winnerId]) {
                pt[winnerId].played += 1;
                pt[winnerId].points += 1;
            }
            if (pt[loserId]) {
                pt[loserId].played += 1;
                pt[loserId].points += 1;
            }
        }

        try {
            await updateDoc(doc(db, 'tournaments', tournamentId), {
                fixtures: newFixtures,
                pointsTable: pt
            });
        } catch (e) {
            console.error(e);
            alert('Failed to update match');
        }
    };

    const resetMatch = async (matchId) => {
        if (!isAdmin) return;
        const match = fixtures.find(f => f.id === matchId);
        if (!match || match.status !== 'completed') return;

        const newFixtures = fixtures.map(f => {
            if (f.id === matchId) {
                return { ...f, status: 'pending', winnerId: null };
            }
            return f;
        });

        const pt = { ...pointsTable };
        const { team1Id, team2Id, winnerId } = match;

        if (winnerId === 'TIE') {
            if (pt[team1Id]) { pt[team1Id].played -= 1; pt[team1Id].points -= 1; }
            if (pt[team2Id]) { pt[team2Id].played -= 1; pt[team2Id].points -= 1; }
        } else {
            const loserId = winnerId === team1Id ? team2Id : team1Id;
            if (pt[winnerId]) { pt[winnerId].played -= 1; pt[winnerId].won -= 1; pt[winnerId].points -= 2; }
            if (pt[loserId]) { pt[loserId].played -= 1; pt[loserId].lost -= 1; }
        }

        try {
            await updateDoc(doc(db, 'tournaments', tournamentId), {
                fixtures: newFixtures,
                pointsTable: pt
            });
        } catch (e) {
            console.error(e);
            alert('Failed to reset match');
        }
    };

    const moveMatch = async (index, direction) => {
        if (!isAdmin) return;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= fixtures.length) return;

        const newFixtures = [...fixtures];
        const temp = newFixtures[index];
        newFixtures[index] = newFixtures[newIndex];
        newFixtures[newIndex] = temp;

        try {
            await updateDoc(doc(db, 'tournaments', tournamentId), {
                fixtures: newFixtures
            });
        } catch (e) {
            console.error(e);
            alert('Failed to reorder matches');
        }
    };

    return (
        <div className="bg-espn-card rounded-xl border border-gray-800 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-espn-red/20 via-espn-card to-espn-card px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center">
                    <Swords className="w-5 h-5 text-espn-red mr-3" />
                    <h2 className="text-lg font-bold uppercase tracking-wider">Match Fixtures</h2>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono bg-gray-800 text-gray-300 px-3 py-1 rounded-full">
                        {completedCount} / {totalCount} completed
                    </span>
                    {/* Progress bar */}
                    <div className="hidden sm:block w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-espn-red to-red-400 rounded-full transition-all duration-500"
                            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Match List */}
            <div className="divide-y divide-gray-800/60">
                {fixtures.map((match, index) => {
                    const isCompleted = match.status === 'completed';
                    const team1Won = match.winnerId === match.team1Id;
                    const team2Won = match.winnerId === match.team2Id;
                    const isTie = match.winnerId === 'TIE';

                    return (
                        <div
                            key={match.id}
                            className={`relative transition-all duration-200 ${isCompleted
                                    ? 'bg-[#0d0d0d] hover:bg-[#141414]'
                                    : 'bg-[#121212] hover:bg-[#181818]'
                                }`}
                        >
                            {/* Match number badge */}
                            <div className="absolute top-0 left-0 bg-gray-800 text-[10px] text-gray-500 font-mono px-2 py-0.5 rounded-br-lg">
                                M{index + 1}
                            </div>

                            <div className="px-6 py-5 pt-7">
                                {/* Teams Row */}
                                <div className="flex items-center justify-between mb-4">
                                    {/* Team 1 */}
                                    <div className={`flex-1 flex items-center space-x-3 ${team1Won ? 'opacity-100' : isCompleted && !isTie ? 'opacity-40' : ''}`}>
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${team1Won
                                                ? 'bg-espn-red/20 text-espn-red border border-espn-red/30'
                                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                                            }`}>
                                            {getTeamName(match.team1Id).charAt(0).toUpperCase()}
                                        </div>
                                        <span className={`font-semibold truncate text-sm sm:text-base ${team1Won ? 'text-white' : 'text-gray-300'
                                            }`}>
                                            {getTeamName(match.team1Id)}
                                        </span>
                                        {team1Won && <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />}
                                    </div>

                                    {/* VS badge */}
                                    <div className="mx-4 shrink-0">
                                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold ${isCompleted
                                                ? 'bg-green-900/30 text-green-500 border border-green-800'
                                                : 'bg-gray-800 text-gray-500 border border-gray-700'
                                            }`}>
                                            {isCompleted ? (isTie ? 'TIE' : '✓') : 'VS'}
                                        </span>
                                    </div>

                                    {/* Team 2 */}
                                    <div className={`flex-1 flex items-center justify-end space-x-3 ${team2Won ? 'opacity-100' : isCompleted && !isTie ? 'opacity-40' : ''}`}>
                                        {team2Won && <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />}
                                        <span className={`font-semibold truncate text-sm sm:text-base text-right ${team2Won ? 'text-white' : 'text-gray-300'
                                            }`}>
                                            {getTeamName(match.team2Id)}
                                        </span>
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${team2Won
                                                ? 'bg-espn-red/20 text-espn-red border border-espn-red/30'
                                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                                            }`}>
                                            {getTeamName(match.team2Id).charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Row */}
                                <div className="flex items-center justify-between">
                                    {/* Reorder Buttons (admin only) */}
                                    {isAdmin ? (
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => moveMatch(index, -1)}
                                                disabled={index === 0}
                                                className="p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                                title="Move up"
                                            >
                                                <ChevronUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => moveMatch(index, 1)}
                                                disabled={index === fixtures.length - 1}
                                                className="p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                                title="Move down"
                                            >
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div />
                                    )}

                                    {/* Status / Winner Buttons */}
                                    {match.status === 'pending' ? (
                                        isAdmin ? (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => markWinner(match.id, match.team1Id, match.team2Id)}
                                                    className="text-xs bg-gray-800 hover:bg-espn-red/80 hover:text-white text-gray-300 font-semibold py-2 px-4 rounded-lg transition-all duration-200 border border-gray-700 hover:border-espn-red"
                                                >
                                                    {getTeamName(match.team1Id)} Wins
                                                </button>
                                                <button
                                                    onClick={() => markWinner(match.id, match.team2Id, match.team1Id)}
                                                    className="text-xs bg-gray-800 hover:bg-espn-red/80 hover:text-white text-gray-300 font-semibold py-2 px-4 rounded-lg transition-all duration-200 border border-gray-700 hover:border-espn-red"
                                                >
                                                    {getTeamName(match.team2Id)} Wins
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center bg-yellow-900/30 text-yellow-500 border border-yellow-700/40 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                                Upcoming
                                            </span>
                                        )
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <span className="inline-flex items-center text-green-400 font-semibold text-xs bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-800/50">
                                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                                {isTie ? 'Tie Match' : `${getTeamName(match.winnerId)} Won`}
                                            </span>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => resetMatch(match.id)}
                                                    className="inline-flex items-center text-xs text-orange-400 hover:text-orange-300 bg-orange-900/20 hover:bg-orange-900/40 border border-orange-800/40 px-3 py-1.5 rounded-lg font-semibold transition-all duration-200"
                                                    title="Reset this match result"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                                    Reset
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
