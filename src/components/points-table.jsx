import { Trophy } from 'lucide-react';

export default function PointsTable({ pointsTable }) {
    if (!pointsTable || Object.keys(pointsTable).length === 0) return <div>No points table data.</div>;

    // Convert pointsTable object to array and sort by points
    const sortedTable = Object.values(pointsTable).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        // Tiebreaker: add NRR logic here if needed, for now just wins
        return b.won - a.won;
    });

    return (
        <div className="bg-espn-card p-6 rounded-xl border border-gray-800 shadow-xl overflow-x-auto">
            <h2 className="text-xl font-bold mb-6 text-espn-lightres flex items-center uppercase tracking-wider">
                <Trophy className="w-5 h-5 mr-2 text-espn-red" />
                Points Table
            </h2>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b-2 border-gray-800 text-gray-500 text-sm uppercase tracking-wider">
                        <th className="py-3 px-2 font-semibold">Team</th>
                        <th className="py-3 px-2 text-center font-semibold text-xs">P</th>
                        <th className="py-3 px-2 text-center font-semibold text-xs">W</th>
                        <th className="py-3 px-2 text-center font-semibold text-xs">L</th>
                        <th className="py-3 px-2 text-center font-semibold text-xs">PTS</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedTable.map((teamStats, idx) => (
                        <tr
                            key={teamStats.name}
                            className={`border-b border-gray-800/50 hover:bg-[#121212] transition-colors ${idx < 4 ? 'bg-green-900/10' : ''}`}
                        >
                            <td className="py-4 px-2 font-bold flex items-center">
                                <span className="w-5 text-gray-500 text-xs mr-3">{idx + 1}</span>
                                {teamStats.name}
                                {idx < 4 && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                            </td>
                            <td className="py-4 px-2 text-center text-gray-300">{teamStats.played}</td>
                            <td className="py-4 px-2 text-center text-green-500 font-semibold">{teamStats.won}</td>
                            <td className="py-4 px-2 text-center text-red-500 font-semibold">{teamStats.lost}</td>
                            <td className="py-4 px-2 text-center text-white font-extrabold text-lg">{teamStats.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 text-xs text-gray-500 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2" />
                Top 4 teams qualify for Playoffs
            </div>
        </div>
    );
}
