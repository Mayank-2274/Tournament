import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout';
import Home from './pages/home';
import Login from './pages/login';
import AdminDashboard from './pages/admin-dashboard';
import ViewerDashboard from './pages/viewer-dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="admin/:tournamentId" element={<AdminDashboard />} />
        <Route path="tournaments/:tournamentId" element={<ViewerDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
