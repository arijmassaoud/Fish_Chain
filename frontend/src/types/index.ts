export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'BUYER' | 'SELLER' | 'VET';
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  imageUrl: string;
  seller?: User
  sellerId: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reservation {
  id: string;
  productId: string;
  buyerId: string;
  quantity: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'RESERVATION' | 'MESSAGE' | 'SYSTEM';
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
} 