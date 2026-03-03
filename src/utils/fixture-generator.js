export const generateRoundRobin = (teams) => {
    if (!teams || teams.length < 2) return [];

    const teamIds = teams.map(t => t.id);
    // If odd number of teams, add a 'dummy' bye team
    const hasBye = teamIds.length % 2 !== 0;
    if (hasBye) {
        teamIds.push('BYE');
    }

    const numTeams = teamIds.length;
    const numRounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;

    let fixtures = [];
    let matchCounter = 1;

    for (let round = 0; round < numRounds; round++) {
        for (let match = 0; match < matchesPerRound; match++) {
            const home = teamIds[match];
            const away = teamIds[numTeams - 1 - match];

            if (home !== 'BYE' && away !== 'BYE') {
                fixtures.push({
                    id: `match_${matchCounter}`,
                    matchNumber: matchCounter,
                    team1Id: home,
                    team2Id: away,
                    status: 'pending', // pending, completed
                    winnerId: null
                });
                matchCounter++;
            }
        }
        // Rotate teams (keep first team fixed)
        teamIds.splice(1, 0, teamIds.pop());
    }

    return fixtures;
};
