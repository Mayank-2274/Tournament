import { Outlet, Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export default function Layout() {
    return (
        <div className="min-h-screen bg-espn-dark text-espn-lightres flex flex-col font-sans">
            <nav className="bg-espn-black border-b border-espn-card px-4 py-3 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2 text-white hover:text-espn-red transition-colors">
                        <Trophy className="w-6 h-6 text-espn-red" />
                        <span className="text-xl font-bold tracking-tight">TOURNAMENT APP</span>
                    </Link>
                    <div className="flex space-x-4">
                        <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                            Admin Login
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>

            <footer className="bg-espn-black border-t border-espn-card mt-auto py-6">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} Live Tournament App. All rights reserved by Mayank Malviya.</p>
                </div>
            </footer>
        </div>
    );
}
