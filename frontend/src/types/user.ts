export interface User {
  _id: string;
  username?: string;
  email: string;
  displayname: string;
  avatarUrl?: string | null;
  bio?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface Friend {
  _id: string;
  username: string;
  displayname: string;
  avatarUrl?: string;
}

export interface FriendRequest {
  _id: string;
  from?: {
    _id: string;
    username: string;
    displayname: string;
    avatarUrl?: string;
  };
  to?: {
    _id: string;
    username: string;
    displayname: string;
    avatarUrl?: string;
  };
  message: string;
  createdAt: string;
  updatedAt: string;
}
