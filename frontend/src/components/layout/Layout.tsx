import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
    const { pathname } = useLocation();
    const isHome = pathname === '/';

    return (
        <div className="min-h-screen flex flex-col bg-page">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            {!isHome && <Footer />}
        </div>
    );
}
