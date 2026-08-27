// Extend this list as Eventora expands into more regions.
export const locations = {
    India: {
        Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru'],
        Maharashtra: ['Mumbai', 'Pune', 'Nagpur'],
        Delhi: ['New Delhi', 'Dwarka', 'Rohini'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
        Telangana: ['Hyderabad', 'Warangal', 'Nizamabad'],
    },
    'United States': {
        California: ['Los Angeles', 'San Francisco', 'San Diego'],
        'New York': ['New York City', 'Buffalo', 'Albany'],
        Texas: ['Austin', 'Dallas', 'Houston'],
    },
    'United Kingdom': {
        England: ['London', 'Manchester', 'Birmingham'],
        Scotland: ['Edinburgh', 'Glasgow', 'Aberdeen'],
    },
};

export const getStates = (country) => country ? Object.keys(locations[country] || {}) : [];

export const getAreas = (country, state) => (
    country && state ? locations[country]?.[state] || [] : []
);
