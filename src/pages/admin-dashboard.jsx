import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import ShareButton from '../components/share-button';
import Fixtures from '../components/fixtures';
import PointsTable from '../components/points-table';
import PlayoffsBracket from '../components/playoffs-bracket';
import { generateRoundRobin } from '../utils/fixture-generator';
import { generatePlayoffs } from '../utils/playoffs-generator';
import { Loader2, Plus, Users, Play, Trophy } from 'lucide-react';

export default function AdminDashboard() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, u => {
      setUser(u);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!tournamentId) return;
    const unsub = onSnapshot(doc(db, 'tournaments', tournamentId), (docSnap) => {
      if (docSnap.exists()) {
        setTournament(docSnap.data());
      } else {
        setTournament(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [tournamentId]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-espn-red" /></div>;
  }

  if (!tournament) {
    return <div className="text-center py-20 text-xl">Tournament Not Found</div>;
  }

  const isAdmin = user?.uid === tournament.adminUid || localStorage.getItem(`tournament_admin_${tournamentId}`) === tournament.adminUid;

  if (!isAdmin) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <p className="text-xl mb-4 text-red-400">Unauthorized Access</p>
        <button onClick={() => navigate(`/tournaments/${tournamentId}`)} className="text-espn-text underline hover:text-white">
          Go to Viewer Dashboard
        </button>
      </div>
    );
  }

  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newTeam = {
      id: `team_${Math.random().toString(36).substring(2, 9)}`,
      name: newTeamName.trim()
    };

    const updatedTeams = [...tournament.teams, newTeam];
    await updateDoc(doc(db, 'tournaments', tournamentId), {
      teams: updatedTeams
    });
    setNewTeamName('');
  };

  const handleRemoveTeam = async (teamId) => {
    const updatedTeams = tournament.teams.filter(t => t.id !== teamId);
    await updateDoc(doc(db, 'tournaments', tournamentId), {
      teams: updatedTeams
    });
  };

  const handleStartLeague = async () => {
    if (tournament.teams.length < 2) {
      alert("Add at least 2 teams to start the league.");
      return;
    }

    const fixtures = generateRoundRobin(tournament.teams);

    // Initialize points table
    const pointsTable = {};
    tournament.teams.forEach(t => {
      pointsTable[t.id] = { played: 0, won: 0, lost: 0, points: 0, nrr: 0, name: t.name };
    });

    await updateDoc(doc(db, 'tournaments', tournamentId), {
      status: 'league',
      fixtures,
      pointsTable
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-espn-card p-6 rounded-xl border border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">{tournament.name}</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span className="uppercase px-2 py-0.5 bg-gray-800 rounded text-gray-300 font-mono">{tournamentId}</span>
            <span>•</span>
            <span className={`capitalize font-semibold ${tournament.status === 'registration' ? 'text-yellow-500' : 'text-green-500'}`}>
              {tournament.status} Phase
            </span>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <ShareButton tournamentId={tournamentId} />
        </div>
      </div>

      {tournament.status === 'registration' && (
        <>
          <div className="bg-yellow-900/10 border border-yellow-700/50 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <h2 className="text-xl font-bold text-yellow-500 mb-1">Tournament Created Successfully!</h2>
              <p className="text-gray-300 text-sm">Share this link with viewers so they can follow the live action.</p>
            </div>
            <div className="flex flex-col items-center sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
              <div className="bg-[#121212] py-2 px-4 rounded-lg border border-gray-700 flex items-center w-full max-w-sm">
                <span className="text-gray-500 font-mono text-sm truncate">{window.location.origin}/tournaments/{tournamentId}</span>
              </div>
              <ShareButton tournamentId={tournamentId} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-espn-card p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold flex items-center mb-4"><Users className="w-5 h-5 mr-2 text-espn-red" /> Register Teams</h2>
            <form onSubmit={handleAddTeam} className="flex space-x-2 mb-6">
              <input
                type="text"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
                className="flex-1 bg-[#121212] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-espn-red"
              />
              <button type="submit" className="bg-espn-red hover:bg-red-700 text-white px-4 rounded-lg flex items-center font-bold transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <ul className="space-y-2">
              {tournament.teams.length === 0 ? (
                <li className="text-gray-500 text-sm italic">No teams registered yet.</li>
              ) : (
                tournament.teams.map((team, idx) => (
                  <li key={team.id} className="flex items-center justify-between bg-[#121212] p-3 rounded-lg border border-gray-800">
                    <span className="font-semibold">{idx + 1}. {team.name}</span>
                    <button onClick={() => handleRemoveTeam(team.id)} className="text-gray-500 hover:text-red-500 transition-colors text-sm">
                      Remove
                    </button>
                  </li>
                ))
              )}
            </ul>

            {tournament.teams.length > 1 && (
              <div className="mt-8 pt-6 border-t border-gray-800">
                <button
                  onClick={handleStartLeague}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Generate Fixtures & Start League
                </button>
              </div>
            )}
          </div>
          <div className="text-gray-400 text-sm">
            <p className="mb-2 font-semibold text-white">Instructions:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Add all participating teams using the form.</li>
              <li>Once all teams are added, click "Generate Fixtures & Start League".</li>
              <li>This will automatically create a Round Robin schedule where each team plays everyone once.</li>
              <li>Share the viewer link with participants so they can follow along live.</li>
            </ul>
          </div>
        </div>
        </>
      )}

      {tournament.status !== 'registration' && (
        <div className="space-y-12">
          {!tournament.playoffs ? (
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <Fixtures
                  tournamentId={tournamentId}
                  fixtures={tournament.fixtures}
                  teams={tournament.teams}
                  isAdmin={true}
                  pointsTable={tournament.pointsTable}
                />
                {tournament.fixtures.every(f => f.status === 'completed') && (
                  <button
                    onClick={async () => {
                      try {
                        const playoffs = generatePlayoffs(tournament.pointsTable);
                        await updateDoc(doc(db, 'tournaments', tournamentId), {
                          playoffs,
                          status: 'playoffs'
                        });
                      } catch (e) {
                        alert(e.message);
                      }
                    }}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-yellow-900/50"
                  >
                    <Trophy className="w-6 h-6 mr-2" />
                    Generate Top 4 Playoffs
                  </button>
                )}
              </div>
              <div className="space-y-8">
                <PointsTable pointsTable={tournament.pointsTable} />
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center text-yellow-500 uppercase tracking-widest">
                  <Trophy className="w-6 h-6 mr-2" /> Championship Playoffs
                </h2>
                <div className="bg-espn-card border border-gray-800 rounded-xl p-6 overflow-x-auto">
                  <PlayoffsBracket tournamentId={tournamentId} playoffs={tournament.playoffs} isAdmin={true} />
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 items-start opacity-75">
                <PointsTable pointsTable={tournament.pointsTable} />
                <Fixtures
                  tournamentId={tournamentId}
                  fixtures={tournament.fixtures}
                  teams={tournament.teams}
                  isAdmin={false}
                  pointsTable={tournament.pointsTable}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
