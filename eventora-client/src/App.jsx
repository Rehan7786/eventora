import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';

function AppContent() {
    const location = useLocation();
    return (
        <div className="animated-location-bg min-h-screen flex flex-col">
            <div className="location-backdrop" aria-hidden="true">
                <span className="map-route route-one"></span>
                <span className="map-route route-two"></span>
                <span className="map-pin pin-one"></span>
                <span className="map-pin pin-two"></span>
                <span className="map-pin pin-three"></span>
            </div>
           
            <Navbar />
            <main key={location.pathname} className="page-enter relative z-10 flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes location={location}>
                        <Route path="/" element={<Home />} />
                        <Route path="/events/:id" element={<EventDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<UserDashboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/payment-success" element={<PaymentSuccess />} />
                        <Route path="/payment-failed" element={<PaymentFailed />} />
                        <Route path="*" element={<h1 className="text-3xl font-bold text-center mt-20">404 - Page Not Found</h1>} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
