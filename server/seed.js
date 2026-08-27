const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

dotenv.config();

const users = [
    { name: 'Admin User', email: 'admin@eventora.com', password: 'password123', role: 'admin' },
    { name: 'Demo User', email: 'user@eventora.com', password: 'password123', role: 'user' },
    { name: 'Alice Smith', email: 'alice@eventora.com', password: 'password123', role: 'user' },
    { name: 'Bob Johnson', email: 'bob@eventora.com', password: 'password123', role: 'user' },
    { name: 'Charlie Dave', email: 'charlie@eventora.com', password: 'password123', role: 'user' },
    { name: 'Diana Prince', email: 'diana@eventora.com', password: 'password123', role: 'user' },
    { name: 'Ethan Hunt', email: 'ethan@eventora.com', password: 'password123', role: 'user' },
    { name: 'Fiona Gallagher', email: 'fiona@eventora.com', password: 'password123', role: 'user' },
    { name: 'George Miller', email: 'george@eventora.com', password: 'password123', role: 'user' },
    { name: 'Hannah Montana', email: 'hannah@eventora.com', password: 'password123', role: 'user' }
];

const baseEvents = [
    {
        title: 'React & Node.js Developer Retreat',
        description: 'Join us for a 3-day deep dive into modern full-stack web development. Perfect for developers looking to take their skills to the next level.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        location: 'Silicon Valley Innovation Center, CA',
        country: 'United States', state: 'California', area: 'San Francisco',
        category: 'Technology',
        totalSeats: 200,
        ticketPrice: 0,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Neon Nights EDM Festival',
        description: 'Experience an unforgettable night of EDM, techno, and dazzling light shows with top DJs from around the globe.',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        location: 'Grand Arena, New York',
        country: 'United States', state: 'New York', area: 'New York City',
        category: 'Music',
        totalSeats: 500,
        ticketPrice: 1500,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Global Leaders Business Summit',
        description: 'A premium gathering of CEOs, founders, and investors discussing the future of global commerce and AI integration.',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        location: 'The Ritz-Carlton, London',
        country: 'United Kingdom', state: 'England', area: 'London',
        category: 'Business',
        totalSeats: 150,
        ticketPrice: 5000,
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Modern Art Expo 2024',
        description: 'Discover breathtaking contemporary and modern arts from underground and trending artists this season.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        location: 'Downtown Art Museum',
        country: 'India', state: 'Karnataka', area: 'Bengaluru',
        category: 'Art',
        totalSeats: 300,
        ticketPrice: 200,
        image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Startup Pitch & Pitch Competition',
        description: 'Watch 25 startups pitch for 1 million dollars in seed funding. Great networking for entrepreneurs and angel investors.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        location: 'Convention Center, Miami',
        country: 'United States', state: 'Texas', area: 'Houston',
        category: 'Business',
        totalSeats: 250,
        ticketPrice: 100,
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Cloud Computing Architecture Seminar',
        description: 'A purely technical breakdown of scalable cloud solutions, multi-region routing, and serverless compute processing.',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        location: 'Tech Hub, Seattle',
        country: 'United States', state: 'California', area: 'San Diego',
        category: 'Technology',
        totalSeats: 100,
        ticketPrice: 600,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Bengaluru AI Builders Meetup',
        description: 'An evening for engineers, product leaders, and founders building practical AI products.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: 'Indiranagar Innovation Hub, Bengaluru',
        country: 'India', state: 'Karnataka', area: 'Bengaluru', category: 'Technology', totalSeats: 120, ticketPrice: 399,
        image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Mysuru Heritage Photography Walk',
        description: 'Capture architectural details and street life with a guided early-morning photography walk.',
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        location: 'Mysore Palace Gate, Mysuru',
        country: 'India', state: 'Karnataka', area: 'Mysuru', category: 'Art', totalSeats: 40, ticketPrice: 250,
        image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Mumbai Product Design Conference',
        description: 'Learn from leading product designers through talks, portfolio reviews, and hands-on sessions.',
        date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        location: 'BKC Convention Hall, Mumbai',
        country: 'India', state: 'Maharashtra', area: 'Mumbai', category: 'Design', totalSeats: 280, ticketPrice: 1200,
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Pune Indie Music Evening',
        description: 'A relaxed open-air showcase of emerging indie bands and singer-songwriters.',
        date: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
        location: 'Koregaon Park Amphitheatre, Pune',
        country: 'India', state: 'Maharashtra', area: 'Pune', category: 'Music', totalSeats: 350, ticketPrice: 499,
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Delhi Climate Innovation Forum',
        description: 'Policy makers, entrepreneurs, and researchers discuss scalable climate solutions for cities.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: 'India Habitat Centre, New Delhi',
        country: 'India', state: 'Delhi', area: 'New Delhi', category: 'Business', totalSeats: 180, ticketPrice: 750,
        image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Chennai Food & Culture Fair',
        description: 'Taste regional favourites, attend chef demonstrations, and discover local artisan stalls.',
        date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        location: 'Marina Community Grounds, Chennai',
        country: 'India', state: 'Tamil Nadu', area: 'Chennai', category: 'Food', totalSeats: 600, ticketPrice: 150,
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Hyderabad Startup Weekend',
        description: 'Form a team, validate an idea, and build a prototype with mentors over one energetic weekend.',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        location: 'HITEC City Campus, Hyderabad',
        country: 'India', state: 'Telangana', area: 'Hyderabad', category: 'Business', totalSeats: 90, ticketPrice: 999,
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'San Francisco Frontend Summit',
        description: 'A one-day summit on accessible interfaces, performance, and modern frontend architecture.',
        date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        location: 'SoMa Conference Center, San Francisco',
        country: 'United States', state: 'California', area: 'San Francisco', category: 'Technology', totalSeats: 220, ticketPrice: 1800,
        image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Austin Makers Market',
        description: 'Meet independent creators selling ceramics, prints, handmade goods, and small-batch products.',
        date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        location: 'East Austin Market Hall, Austin',
        country: 'United States', state: 'Texas', area: 'Austin', category: 'Community', totalSeats: 450, ticketPrice: 0,
        image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Manchester Creative Coding Lab',
        description: 'Experiment with generative art, sound, and interactive visuals in a beginner-friendly workshop.',
        date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        location: 'Northern Quarter Studio, Manchester',
        country: 'United Kingdom', state: 'England', area: 'Manchester', category: 'Technology', totalSeats: 60, ticketPrice: 35,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Edinburgh Literature Night',
        description: 'Enjoy readings and conversations with contemporary writers in an intimate historic venue.',
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        location: 'Old Town Reading Room, Edinburgh',
        country: 'United Kingdom', state: 'Scotland', area: 'Edinburgh', category: 'Literature', totalSeats: 80, ticketPrice: 20,
        image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800'
    }
];

// India-first technology catalogue. The state and area values intentionally
// match the client location filters, so these events can be discovered through
// country, state, and local-area search.
const indianTechEventDetails = [
    ['Bengaluru GenAI Product Summit', 'Karnataka', 'Bengaluru', 'Koramangala Convention Centre', 'production-ready generative AI', 8, 450, 280],
    ['Bengaluru Cloud Native Day', 'Karnataka', 'Bengaluru', 'Whitefield Tech Park', 'Kubernetes and cloud-native platforms', 12, 599, 220],
    ['Bengaluru Cybersecurity Leadership Forum', 'Karnataka', 'Bengaluru', 'Electronic City Innovation Hall', 'security engineering and incident response', 18, 799, 180],
    ['Bengaluru Women in Data Meetup', 'Karnataka', 'Bengaluru', 'Indiranagar Community Lab', 'data careers, analytics, and mentorship', 22, 0, 100],
    ['Mysuru Robotics and Automation Expo', 'Karnataka', 'Mysuru', 'Mysuru Innovation Centre', 'robotics, automation, and embedded systems', 27, 349, 160],
    ['Mysuru Open Source Contributors Day', 'Karnataka', 'Mysuru', 'Vijayanagar Developer Hub', 'open-source collaboration and maintainership', 31, 0, 90],
    ['Mangaluru FinTech Builders Meetup', 'Karnataka', 'Mangaluru', 'Mangaluru Startup Studio', 'payments, fintech APIs, and compliance', 36, 299, 120],
    ['Mangaluru IoT on the Coast', 'Karnataka', 'Mangaluru', 'Kadri Innovation Lab', 'IoT prototypes and edge computing', 41, 249, 110],
    ['Mumbai AI and Media Conference', 'Maharashtra', 'Mumbai', 'BKC Convention Hall', 'AI tools for media and creative teams', 9, 999, 320],
    ['Mumbai DevOps Exchange', 'Maharashtra', 'Mumbai', 'Powai Technology Centre', 'reliable delivery pipelines and platform engineering', 15, 649, 200],
    ['Mumbai Web3 Policy Roundtable', 'Maharashtra', 'Mumbai', 'Lower Parel Forum', 'web3 products, regulation, and responsible innovation', 21, 499, 130],
    ['Mumbai UX Research Camp', 'Maharashtra', 'Mumbai', 'Andheri Design Studio', 'user research methods for digital products', 26, 399, 120],
    ['Pune Applied Machine Learning Day', 'Maharashtra', 'Pune', 'Baner Tech Campus', 'applied machine learning and model evaluation', 11, 699, 250],
    ['Pune JavaScript Community Conference', 'Maharashtra', 'Pune', 'Koregaon Park Conference Hall', 'modern JavaScript, React, and web performance', 17, 449, 220],
    ['Pune SaaS Founders and Engineers Meetup', 'Maharashtra', 'Pune', 'Viman Nagar Startup House', 'building and scaling Indian SaaS products', 29, 299, 150],
    ['Pune Data Engineering Workshop', 'Maharashtra', 'Pune', 'Hinjawadi Learning Hub', 'data pipelines, warehousing, and observability', 38, 799, 100],
    ['Nagpur Smart Cities Tech Forum', 'Maharashtra', 'Nagpur', 'Nagpur Digital Centre', 'urban technology and smart-city platforms', 24, 199, 180],
    ['Nagpur Mobile App Builders Meetup', 'Maharashtra', 'Nagpur', 'Civil Lines Innovation Space', 'Android, iOS, and cross-platform development', 44, 0, 100],
    ['New Delhi India AI Governance Summit', 'Delhi', 'New Delhi', 'India Habitat Centre', 'AI governance, safety, and public policy', 13, 1200, 300],
    ['New Delhi Government Tech Showcase', 'Delhi', 'New Delhi', 'Pragati Maidan', 'digital public infrastructure and civic technology', 20, 0, 450],
    ['New Delhi Product Management Circle', 'Delhi', 'New Delhi', 'Connaught Place Innovation Hub', 'product discovery, strategy, and execution', 33, 349, 160],
    ['Dwarka AR VR Experience Lab', 'Delhi', 'Dwarka', 'Dwarka Innovation Lab', 'AR, VR, and spatial-computing prototypes', 28, 249, 100],
    ['Dwarka Ethical Hacking Workshop', 'Delhi', 'Dwarka', 'Sector 12 Tech Academy', 'ethical hacking and practical application security', 46, 599, 80],
    ['Rohini School of Code Hackathon', 'Delhi', 'Rohini', 'Rohini Community Tech Hall', 'student-led apps for local challenges', 51, 0, 180],
    ['Rohini Data Analytics Bootcamp', 'Delhi', 'Rohini', 'Sector 9 Learning Centre', 'analytics fundamentals and dashboard storytelling', 56, 299, 90],
    ['Chennai Deep Tech and Chips Forum', 'Tamil Nadu', 'Chennai', 'OMR Technology Park', 'semiconductors, deep tech, and R&D', 10, 899, 230],
    ['Chennai Python Community Day', 'Tamil Nadu', 'Chennai', 'T Nagar Developer Space', 'Python, automation, and data applications', 19, 299, 170],
    ['Chennai QA Automation Summit', 'Tamil Nadu', 'Chennai', 'Guindy Engineering Centre', 'test automation and quality engineering', 34, 549, 150],
    ['Chennai Climate Tech Buildathon', 'Tamil Nadu', 'Chennai', 'Adyar Innovation Studio', 'technology for climate resilience', 48, 0, 140],
    ['Coimbatore Industry 4.0 Expo', 'Tamil Nadu', 'Coimbatore', 'Coimbatore Trade Centre', 'industrial IoT and smart manufacturing', 16, 499, 240],
    ['Coimbatore No Code Makers Meetup', 'Tamil Nadu', 'Coimbatore', 'RS Puram Startup Studio', 'no-code tools and rapid product prototyping', 39, 0, 100],
    ['Madurai Digital Health Forum', 'Tamil Nadu', 'Madurai', 'Madurai Innovation Centre', 'health-tech workflows and patient experience', 30, 249, 130],
    ['Madurai Frontend Fellowship Day', 'Tamil Nadu', 'Madurai', 'Anna Nagar Learning Hub', 'accessible frontend engineering and peer learning', 53, 149, 90],
    ['Hyderabad Data Science Conference', 'Telangana', 'Hyderabad', 'HITEC City Convention Centre', 'data science, MLOps, and analytics', 7, 1099, 350],
    ['Hyderabad Cyber Defense Drill', 'Telangana', 'Hyderabad', 'Gachibowli Security Lab', 'hands-on cyber defense and threat response', 14, 699, 140],
    ['Hyderabad Blockchain Developer Day', 'Telangana', 'Hyderabad', 'Madhapur Developer Hub', 'blockchain architecture and developer tooling', 23, 399, 180],
    ['Hyderabad Cloud Security Meetup', 'Telangana', 'Hyderabad', 'Kondapur Tech Commons', 'cloud identity, security posture, and resilience', 37, 299, 130],
    ['Hyderabad Tech Careers Fair', 'Telangana', 'Hyderabad', 'HITEC City Career Centre', 'engineering careers, portfolios, and hiring', 49, 0, 500],
    ['Warangal AgriTech Innovation Day', 'Telangana', 'Warangal', 'Warangal Startup Centre', 'technology for agriculture and rural supply chains', 25, 199, 120],
    ['Warangal Student App Challenge', 'Telangana', 'Warangal', 'Kakatiya Tech Campus', 'student mobile apps and product demos', 42, 0, 150],
    ['Nizamabad Digital Commerce Meetup', 'Telangana', 'Nizamabad', 'Nizamabad Business Hub', 'e-commerce, payments, and local businesses', 32, 149, 100],
    ['Nizamabad AI for Small Business Workshop', 'Telangana', 'Nizamabad', 'Nizamabad Learning Studio', 'practical AI adoption for small businesses', 58, 199, 80],
    ['Bengaluru Accessibility in Tech Summit', 'Karnataka', 'Bengaluru', 'HSR Layout Community Hall', 'inclusive design and accessible software', 54, 349, 170],
    ['Mumbai Engineering Management Forum', 'Maharashtra', 'Mumbai', 'Bandra Technology House', 'healthy engineering teams and technical strategy', 61, 749, 150],
    ['Pune Developer Tools Showcase', 'Maharashtra', 'Pune', 'Kalyani Nagar Innovation Centre', 'developer productivity and platform tools', 64, 199, 160],
    ['New Delhi Open Data Civic Hackathon', 'Delhi', 'New Delhi', 'Lodhi Road Collaboration Space', 'open data and civic-tech solutions', 67, 0, 200],
    ['Chennai Embedded Systems Workshop', 'Tamil Nadu', 'Chennai', 'Velachery Hardware Lab', 'embedded systems, sensors, and prototyping', 70, 649, 75],
    ['Hyderabad Startup CTO Roundtable', 'Telangana', 'Hyderabad', 'Jubilee Hills Founder House', 'technology strategy for growing startups', 73, 899, 100],
    ['Coimbatore AI for Manufacturing Lab', 'Tamil Nadu', 'Coimbatore', 'Peelamedu Industry Lab', 'AI use cases for modern manufacturing', 76, 449, 110],
    ['Mangaluru Developer Community Picnic', 'Karnataka', 'Mangaluru', 'Panambur Community Grounds', 'networking and community-led developer learning', 79, 0, 200],
];

const indianTechImages = [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1516321310766-d83ba8691c6c?auto=format&fit=crop&q=80&w=800',
];

const indianTechEvents = indianTechEventDetails.map(([title, state, area, venue, focus, daysFromNow, ticketPrice, totalSeats], index) => ({
    title,
    description: `A practical technology event for India’s builders, exploring ${focus}. Meet peers, learn from local experts, and take home ideas you can apply immediately.`,
    date: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000),
    location: `${venue}, ${area}`,
    country: 'India',
    state,
    area,
    category: 'Technology',
    totalSeats,
    ticketPrice,
    image: indianTechImages[index],
}));

const events = [...baseEvents, ...indianTechEvents];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventora');
        console.log('\n✅ MongoDB connection open...');

        await User.deleteMany();
        await Event.deleteMany();
        await Booking.deleteMany();
        console.log('🗑️  Cleared existing data.');

        // Hash user passwords
        const salt = await bcrypt.genSalt(10);
        const hashedUsers = users.map(u => ({
            ...u,
            password: bcrypt.hashSync(u.password, salt),
            isVerified: true
        }));

        const createdUsers = await User.insertMany(hashedUsers);
        const adminUser = createdUsers.find(u => u.role === 'admin');
        const normalUsers = createdUsers.filter(u => u.role === 'user');
        console.log(`👤 Created ${createdUsers.length} total dummy users.`);

        // Link events to admin
        const eventsWithAdmin = events.map(e => ({
            ...e,
            availableSeats: e.totalSeats,
            createdBy: adminUser._id
        }));

        const createdEvents = await Event.insertMany(eventsWithAdmin);
        console.log(`🎉 Created ${createdEvents.length} distinct events with Unsplash images.`);

        // Generate Bookings Data
        const bookingsData = [];

        for (const event of createdEvents) {
            // Assign 3-6 random users to each event
            const randomCount = Math.floor(Math.random() * 4) + 3;
            // Shuffle and pick random users
            const shuffledUsers = [...normalUsers].sort(() => 0.5 - Math.random());
            const selectedUsers = shuffledUsers.slice(0, randomCount);

            for (const user of selectedUsers) {
                // Randomize statuses
                const statuses = ['pending', 'confirmed', 'cancelled'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                let paymentStatus = 'not_paid';
                if (status === 'confirmed' && event.ticketPrice > 0) {
                    // Usually confirmed tickets are marked paid (90% of the time)
                    paymentStatus = Math.random() > 0.1 ? 'paid' : 'not_paid';
                } else if (event.ticketPrice === 0) {
                    paymentStatus = 'paid';
                }

                bookingsData.push({
                    userId: user._id,
                    eventId: event._id,
                    status: status,
                    paymentStatus: paymentStatus,
                    amount: event.ticketPrice
                });

                // Deduct available seats specifically for confirmed tickets!
                if (status === 'confirmed') {
                    event.availableSeats -= 1;
                    await event.save();
                }
            }
        }

        await Booking.insertMany(bookingsData);
        console.log(`🎫 Inserted ${bookingsData.length} randomized dummy bookings (confirmed, pending, cancelled, paid, not_paid).`);

        console.log('\n🚀 Database seeded successfully!');
        console.log('-------------------------------------------');
        console.log('Admin Email: admin@eventora.com');
        console.log('User Email:  user@eventora.com');
        console.log('Password for all users: password123');
        console.log('-------------------------------------------\n');

        process.exit();
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedDatabase();
