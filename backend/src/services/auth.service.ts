import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';

export const registerUser = async (data: any) => {
  const { name, email, password } = data;

  const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existingUser) {
    throw { statusCode: 409, message: 'Email already exists' };
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
    },
  });

  const token = generateToken(user.id);

  return {
    user: { id: user.id, name: user.name, email: user.email, bio: user.bio, profileImage: user.profileImage, postsCount: 0, followersCount: 0, followingCount: 0 },
    token,
  };
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({ 
    where: { email: email.toLowerCase() },
    include: { _count: { select: { posts: true, followers: true, following: true } } }
  });
  if (!user) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  if (!user.passwordHash) { throw { statusCode: 401, message: 'Please login with Google' }; }
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  const token = generateToken(user.id);

  return {
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
      postsCount: user._count.posts, followersCount: user._count.followers, followingCount: user._count.following 
    },
    token,
  };
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    include: {
      _count: {
        select: { posts: true, followers: true, following: true }
      }
    }
  });
  
  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    profileImage: user.profileImage,
    postsCount: user._count.posts, followersCount: user._count.followers, followingCount: user._count.following,
  };
};

export const updateProfile = async (userId: string, data: any) => {
  const { name, bio, profileImage, profileImageUpdatedAt } = data;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(profileImage !== undefined && { profileImage }),
      ...(profileImageUpdatedAt !== undefined && { profileImageUpdatedAt }),
    },
    include: {
      _count: {
        select: { posts: true, followers: true, following: true }
      }
    }
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    profileImage: user.profileImage,
    postsCount: user._count.posts, followersCount: user._count.followers, followingCount: user._count.following,
  };
};

export const googleAuth = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  
  if (!payload || !payload.email) {
    throw { statusCode: 400, message: 'Invalid Google Token' };
  }

  const email = payload.email.toLowerCase();
  const googleId = payload.sub;
  const name = payload.name || 'Unknown User';
  const profileImage = payload.picture;

  let user = await prisma.user.findUnique({
    where: { email },
    include: { _count: { select: { posts: true, followers: true, following: true } } }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        googleId,
        profileImage,
      },
      include: { _count: { select: { posts: true, followers: true, following: true } } }
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, profileImage: user.profileImage || profileImage },
      include: { _count: { select: { posts: true, followers: true, following: true } } }
    });
  }

  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
      postsCount: user._count.posts, followersCount: user._count.followers, followingCount: user._count.following
    },
    token
  };
};
