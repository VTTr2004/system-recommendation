
import { User, Place, UserPlace, Comment } from './types';

export const MOCK_USERS: User[] = [
  {
    user_id: 'u1',
    user_name: 'user_a',
    full_name: 'Nguyễn Văn A',
    avatar_url: 'https://picsum.photos/seed/u1/100/100',
    role: 'user'
  },
  {
    user_id: 'u2',
    user_name: 'admin',
    full_name: 'Quản trị viên',
    avatar_url: 'https://picsum.photos/seed/u2/100/100',
    role: 'admin'
  }
];

export const MOCK_PLACES: Place[] = [
  {
    place_id: 'p1',
    place_name: 'Vịnh Hạ Long',
    address: 'Quảng Ninh',
    thumb_url: 'https://picsum.photos/seed/p1/400/300',
    description: 'Di sản thiên nhiên thế giới với hàng ngàn đảo đá vôi.',
    content: 'Nội dung chi tiết về Vịnh Hạ Long...'
  },
  {
    place_id: 'p2',
    place_name: 'Phố Cổ Hội An',
    address: 'Quảng Nam',
    thumb_url: 'https://picsum.photos/seed/p2/400/300',
    description: 'Đô thị cổ được bảo tồn nguyên vẹn từ thế kỷ 16.',
    content: 'Nội dung chi tiết về Hội An...'
  },
  {
    place_id: 'p3',
    place_name: 'Đà Lạt',
    address: 'Lâm Đồng',
    thumb_url: 'https://picsum.photos/seed/p3/400/300',
    description: 'Thành phố ngàn hoa với khí hậu ôn hòa.',
    content: 'Nội dung chi tiết về Đà Lạt...'
  }
];

export const MOCK_USER_PLACES: UserPlace[] = [
  { user_id: 'u1', place_id: 'p1' }
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    username: 'user_a',
    place_id: 'p1',
    content: 'Chỗ này rất đẹp, tôi rất thích!',
    date: '2023-10-25',
    rating: 5,
    place_name: 'Vịnh Hạ Long'
  },
  {
    id: 'c2',
    username: 'user_a',
    place_id: 'p2',
    content: 'Đồ ăn ngon nhưng hơi đông khách.',
    date: '2023-11-01',
    rating: 4,
    place_name: 'Phố Cổ Hội An'
  }
];
