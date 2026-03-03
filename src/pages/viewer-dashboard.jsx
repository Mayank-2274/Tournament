import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Fixtures from '../components/fixtures';
import PointsTable from '../components/points-table';
import PlayoffsBracket from '../components/playoffs-bracket';
import { Loader2, ArrowLeft, Trophy } from 'lucide-react';
import ShareButton from '../components/share-button';

export default function ViewerDashboard() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

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
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Tournament Not Found</h2>
        <Link to="/" className="text-espn-red hover:underline flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-espn-card p-6 rounded-xl border border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">{tournament.name}</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span className="uppercase px-2 py-0.5 bg-gray-800 rounded text-gray-300 font-mono">ID: {tournamentId}</span>
            <span>•</span>
            <span className={`capitalize font-semibold ${tournament.status === 'registration' ? 'text-yellow-500' : 'text-green-500'}`}>
              {tournament.status} Phase
            </span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <ShareButton tournamentId={tournamentId} />
        </div>
      </div>

      {tournament.status === 'registration' ? (
        <div className="bg-espn-card p-12 text-center rounded-xl border border-gray-800">
          <Loader2 className="w-12 h-12 animate-spin text-espn-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Registration in Progress...</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            The admin is currently adding teams. The league fixtures and points table will appear here automatically once the tournament starts.
          </p>
          <div className="mt-8 flex justify-center">
            <span className="bg-gray-800 px-4 py-2 rounded-full text-sm font-semibold text-gray-300">
              {tournament.teams?.length || 0} Teams Joined
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {tournament.playoffs && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center text-yellow-500 uppercase tracking-widest">
                <Trophy className="w-6 h-6 mr-2" /> Championship Playoffs
              </h2>
              <div className="bg-espn-card border border-gray-800 rounded-xl p-6 overflow-x-auto">
                <PlayoffsBracket tournamentId={tournamentId} playoffs={tournament.playoffs} isAdmin={false} />
              </div>
            </div>
          )}
          <div className={`grid lg:grid-cols-2 gap-8 items-start ${tournament.playoffs ? 'opacity-75' : ''}`}>
            <Fixtures 
              tournamentId={tournamentId} 
              fixtures={tournament.fixtures} 
              teams={tournament.teams} 
              isAdmin={false} 
            />
            <div className="space-y-8">
              <PointsTable pointsTable={tournament.pointsTable} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
