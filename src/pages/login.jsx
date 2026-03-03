import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { Trophy, Plus, LogOut, Loader2 } from 'lucide-react';

const generateTournamentId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 3; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TRN-${result}`;
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [loadingTournaments, setLoadingTournaments] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (user) {
            const fetchTournaments = async () => {
                setLoadingTournaments(true);
                try {
                    const q = query(collection(db, 'tournaments'), where('adminUid', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    const fetchedTournaments = [];
                    querySnapshot.forEach((doc) => {
                        fetchedTournaments.push({ id: doc.id, ...doc.data() });
                    });

                    // Sort by createdAt descending
                    fetchedTournaments.sort((a, b) => {
                        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                        return timeB - timeA;
                    });

                    setTournaments(fetchedTournaments);
                } catch (err) {
                    console.error("Error fetching tournaments: ", err);
                } finally {
                    setLoadingTournaments(false);
                }
            };
            fetchTournaments();
        }
    }, [user]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTournament = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const tId = generateTournamentId();
            // Store secret in localStorage just in case as requested
            localStorage.setItem(`tournament_admin_${tId}`, user.uid);

            const tournamentRef = doc(db, 'tournaments', tId);
            await setDoc(tournamentRef, {
                adminUid: user.uid,
                name: `Tournament ${tId}`,
                status: 'registration',
                createdAt: serverTimestamp(),
                teams: [],
                fixtures: [],
                pointsTable: {},
                playoffs: null
            });

            navigate(`/admin/${tId}`);
        } catch (err) {
            console.error(err);
            setError('Failed to create tournament. Is Firestore configured?');
        } finally {
            setLoading(false);
        }
    };

    if (user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 w-full max-w-lg mx-auto">
                <div className="bg-espn-card p-8 rounded-xl shadow-2xl w-full border border-gray-800 text-center">
                    <Trophy className="w-16 h-16 text-espn-red mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Welcome Admin</h2>
                    <p className="text-gray-400 mb-8">{user.email}</p>

                    {error && <div className="bg-red-900/50 text-red-200 p-3 rounded mb-6 text-sm">{error}</div>}

                    <button
                        onClick={handleCreateTournament}
                        disabled={loading}
                        className="w-full bg-espn-red hover:bg-red-700 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center mb-4 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Create New Tournament</>}
                    </button>

                    <button
                        onClick={() => signOut(auth)}
                        className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-2" /> Sign Out
                    </button>

                    {loadingTournaments ? (
                        <div className="flex justify-center mt-8">
                            <Loader2 className="w-8 h-8 animate-spin text-espn-red" />
                        </div>
                    ) : (
                        tournaments.length > 0 && (
                            <div className="mt-8 text-left">
                                <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Your Tournaments</h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {tournaments.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => navigate(`/admin/${t.id}`)}
                                            className="w-full bg-[#1e1e1e] hover:bg-gray-800 border border-gray-700 rounded-lg p-4 flex justify-between items-center transition-colors text-left"
                                        >
                                            <div>
                                                <p className="font-bold text-white text-lg">{t.name}</p>
                                                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">ID: {t.id} • Status: {t.status}</p>
                                            </div>
                                            <Trophy className="w-5 h-5 text-gray-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 w-full max-w-md mx-auto">
            <div className="bg-espn-card p-8 rounded-xl shadow-2xl w-full border border-gray-800">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isRegistering ? 'Create Admin Account' : 'Admin Login'}
                </h2>

                {error && <div className="bg-red-900/50 text-red-200 p-3 rounded mb-6 text-sm">{error}</div>}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-espn-red"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-espn-red"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-espn-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegistering ? 'Register' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-gray-400 hover:text-white text-sm"
                    >
                        {isRegistering ? 'Already have an account? Sign In' : 'Need an admin account? Register'}
                    </button>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <span className="border-b border-gray-700 w-1/5 lg:w-1/4"></span>
                    <span className="text-xs text-center text-gray-500 uppercase">Or log in with</span>
                    <span className="border-b border-gray-700 w-1/5 lg:w-1/4"></span>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full mt-6 bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>
            </div>
        </div>
    );
}
