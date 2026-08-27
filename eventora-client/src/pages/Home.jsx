import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaRegClock, FaTicketAlt, FaShieldAlt } from 'react-icons/fa';
import { locations, getAreas, getStates } from '../data/locations';

const EVENTS_PER_PAGE = 30;

const Home = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [area, setArea] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalEvents, setTotalEvents] = useState(0);

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/events', { params: { search, country, state, area, page, limit: EVENTS_PER_PAGE } });
            setEvents(data.events);
            setTotalEvents(data.pagination.total);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    }, [search, country, state, area, page]);

    useEffect(() => {
        const timeoutId = setTimeout(fetchEvents, 400); // 400ms debounce
        return () => clearTimeout(timeoutId);
    }, [fetchEvents]);

    const totalPages = Math.ceil(totalEvents / EVENTS_PER_PAGE);
    const firstResult = totalEvents === 0 ? 0 : (page - 1) * EVENTS_PER_PAGE + 1;
    const lastResult = Math.min(page * EVENTS_PER_PAGE, totalEvents);
    const changePage = (nextPage) => {
        setPage(nextPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <div className="motion-rise relative bg-black text-white rounded-3xl overflow-hidden mb-12 shadow-2xl">
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                <div className="relative p-10 md:p-20 text-center flex flex-col items-center z-10">
                    <span className="bg-white/20 text-white backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-white/20">Welcome to Eventora</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight drop-shadow-lg">
                        Find Your Next <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">Unforgettable</span> Experience
                    </h1>
                    <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                        Discover the best tech conferences, late-night music festivals, and hands-on workshops happening directly in your area. Secure your spot today.
                    </p>

                    <div className="w-full max-w-2xl mx-auto relative flex items-center shadow-2xl group">
                        <FaSearch className="absolute left-6 text-gray-500 text-xl group-focus-within:text-black transition-colors" />
                        <input
                            type="text"
                            placeholder="Search events by title..."
                            className="w-full pl-16 pr-6 py-5 rounded-full text-lg text-black bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-gray-500 focus:outline-none transition-all placeholder-gray-400 font-medium"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-left">
                        <select value={country} onChange={(e) => { setCountry(e.target.value); setState(''); setArea(''); setPage(1); }} className="rounded-xl px-4 py-3 text-gray-900 bg-white/95 font-medium">
                            <option value="">All countries</option>
                            {Object.keys(locations).map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                        <select value={state} disabled={!country} onChange={(e) => { setState(e.target.value); setArea(''); setPage(1); }} className="rounded-xl px-4 py-3 text-gray-900 bg-white/95 font-medium disabled:bg-gray-300">
                            <option value="">All states</option>
                            {getStates(country).map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                        <select value={area} disabled={!state} onChange={(e) => { setArea(e.target.value); setPage(1); }} className="rounded-xl px-4 py-3 text-gray-900 bg-white/95 font-medium disabled:bg-gray-300">
                            <option value="">All local areas</option>
                            {getAreas(country, state).map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Why Choose Us / Features row */}
            <div className="motion-stagger grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                    <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-gray-200/50">
                        <FaRegClock />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Booking</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Secure your tickets instantly with our fast streamlined booking infrastructure built for speed.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                    <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-gray-200/50">
                        <FaTicketAlt />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Seamless Access</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Download tickets instantly or manage them right from your personal dashboard with easily.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                    <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-gray-200/50">
                        <FaShieldAlt />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Platform</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">All transactions and registrations are bounded by cutting-edge security and 2FA OTP tech.</p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-8 px-2 border-b border-gray-200 pb-4">
                <h2 className="text-3xl font-extrabold text-gray-900">Upcoming Events</h2>
                <div className="text-gray-500 font-medium">{totalEvents} results found</div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-xl font-semibold text-gray-600">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 text-xl text-gray-500">No events found matching your search.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, index) => (
                        <div key={event._id} style={{ animationDelay: `${Math.min(index * 55, 440)}ms` }} className="motion-card bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition flex flex-col">
                            <div className="h-48 bg-gray-200 overflow-hidden relative">
                                {event.image ? (
                                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold text-2xl">
                                        {event.category || 'Event'}
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                    {event.ticketPrice === 0 ? <span className="text-green-600">FREE</span> : <span className="text-gray-900">₹{event.ticketPrice}</span>}
                                </div>
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{event.category}</div>
                                <h2 className="text-xl font-bold text-gray-800 mb-3">{event.title}</h2>
                                <div className="flex flex-col gap-2 mb-4 text-gray-600 text-sm">
                                    <div className="flex items-center gap-2">
                                        <FaCalendarAlt className="text-gray-400" />
                                        <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-gray-400" />
                                        <span>{[event.area, event.state, event.country].filter(Boolean).join(', ') || event.location}</span>
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                        <div className="bg-gray-700 h-2 rounded-full" style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4">{event.availableSeats} of {event.totalSeats} seats remaining</p>
                                    <Link to={`/events/${event._id}`} className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 rounded-lg transition">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && totalPages > 1 && (
                <nav className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100" aria-label="Event pages">
                    <p className="text-sm text-gray-500">Showing {firstResult}–{lastResult} of {totalEvents} events</p>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => changePage(page - 1)} disabled={page === 1} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition">Previous</button>
                        <span className="px-3 text-sm font-bold text-gray-700" aria-current="page">Page {page} of {totalPages}</span>
                        <button type="button" onClick={() => changePage(page + 1)} disabled={page === totalPages} className="px-4 py-2 rounded-lg bg-gray-900 text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black transition">Next</button>
                    </div>
                </nav>
            )}

            {/* Footer Section */}
            <footer className="mt-auto pt-16 pb-8 border-t border-gray-200 text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <FaTicketAlt className="text-gray-800 text-2xl" />
                    <span className="text-xl font-bold text-gray-900">Eventora</span>
                </div>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                    The simplest, most dynamic way to manage, discover, and host world-class events in your local city. Let's make memories together.
                </p>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    &copy; {new Date().getFullYear()} Eventora Platform. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;
