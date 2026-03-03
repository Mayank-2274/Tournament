// Logic for IPL-style playoffs
export const generatePlayoffs = (pointsTable) => {
    // Get top 4 teams sorted by points, then wins
    const sortedTeams = Object.values(pointsTable)
        .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.won - a.won;
        });

    if (sortedTeams.length < 4) {
        throw new Error('Need at least 4 teams to generate playoffs');
    }

    const top4 = sortedTeams.slice(0, 4);

    return {
        qualifier1: {
            id: 'q1',
            name: 'Qualifier 1',
            team1Id: top4[0].name, // Storing names directly for simplicity, or we can store IDs
            team2Id: top4[1].name,
            winnerId: null,
            loserId: null,
            status: 'pending' // pending, completed
        },
        eliminator: {
            id: 'elim',
            name: 'Eliminator',
            team1Id: top4[2].name,
            team2Id: top4[3].name,
            winnerId: null,
            status: 'pending'
        },
        qualifier2: {
            id: 'q2',
            name: 'Qualifier 2',
            team1Id: 'Loser Qualifier 1',
            team2Id: 'Winner Eliminator',
            winnerId: null,
            status: 'pending'
        },
        final: {
            id: 'final',
            name: 'Final',
            team1Id: 'Winner Qualifier 1',
            team2Id: 'Winner Qualifier 2',
            winnerId: null,
            status: 'pending'
        },
        champion: null
    };
};
