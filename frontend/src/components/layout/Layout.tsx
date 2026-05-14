import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.tsx';

export default function Layout() {
    return (
        <div className="min-h-screen bg-[#080808]">
            <Navbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
}