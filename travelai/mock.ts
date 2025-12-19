import { User, Place, Comment } from './types';

// Mock User A
export const MOCK_USER: User = {
  user_id: '1',
  user_name: 'usera',
  full_name: 'User A',
  avatar_url: 'https://picsum.photos/200/200',
};

// Mock Places
export const MOCK_PLACES: Place[] = [
  {
    place_id: '1',
    place_name: 'Ha Long Bay',
    address: 'Quang Ninh, Vietnam',
    thumb_url: 'https://picsum.photos/800/400?random=1',
    description: 'A UNESCO World Heritage Site featuring thousands of limestone karsts.',
    content: '# Ha Long Bay\n\nHa Long Bay features thousands of limestone karsts and isles in various shapes and sizes. \n\n## Activities\n- Kayaking\n- Cave exploration\n- Overnight cruise',
  },
  {
    place_id: '2',
    place_name: 'Hoi An Ancient Town',
    address: 'Quang Nam, Vietnam',
    thumb_url: 'https://picsum.photos/800/400?random=2',
    description: 'An exceptionally well-preserved example of a South-East Asian trading port.',
    content: '# Hoi An Ancient Town\n\nHoi An is a city on Vietnam’s central coast known for its well-preserved Ancient Town, cut through with canals.\n\n## Highlights\n- Japanese Covered Bridge\n- Lantern Festival\n- Tailor shops',
  },
  {
    place_id: '3',
    place_name: 'Da Lat (AI Suggested)',
    address: 'Lam Dong, Vietnam',
    thumb_url: 'https://picsum.photos/800/400?random=3',
    description: 'The city of eternal spring.',
    content: '# Da Lat\n\nKnown for its cool weather and French colonial architecture.',
  }
];

// Mock Comments
export const MOCK_COMMENTS: Comment[] = [
  {
    id: '101',
    username: 'traveler123',
    place_id: '1',
    content: 'Amazing experience! Must visit.',
    date: '2023-10-15',
  },
  {
    id: '102',
    username: 'wanderlust_jane',
    place_id: '1',
    content: 'The sunset was breathtaking.',
    date: '2023-10-16',
  },
];

// Mock Summary Content
export const MOCK_SUMMARY = `
# About TravelAI

TravelAI is your smart companion for discovering the world. 

## Features
- **Smart Recommendations**: AI-powered suggestions based on your interests.
- **Trip Tracking**: Keep a log of all the places you've visited.
- **Community**: Share your experiences with others.

*Start your journey today!*
`;
