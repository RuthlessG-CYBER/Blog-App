import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';

const generateUniqueUsername = async (name: string): Promise<string> => {
  let baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!baseUsername) {
    baseUsername = 'user';
  }
  
  let username = baseUsername;
  let counter = 1;
  let isUnique = false;
  
  while (!isUnique) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) {
      isUnique = true;
    } else {
      username = `${baseUsername}${counter}`;
      counter++;
    }
  }
  
  return username;
};

export const registerUser = async (data: any) => {
  const { name, email, password } = data;

  const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existingUser) {
    throw { statusCode: 409, message: 'Email already exists' };
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const username = await generateUniqueUsername(name);

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email: email.toLowerCase(),
      passwordHash,
    },
  });

  const token = generateToken(user.id);

  return {
    user: { id: user.id, name: user.name, username: user.username, email: user.email, bio: user.bio, profileImage: user.profileImage, postsCount: 0, followersCount: 0, followingCount: 0 },
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
      username: user.username,
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
    username: user.username,
    email: user.email,
    bio: user.bio,
    profileImage: user.profileImage,
    postsCount: user._count.posts, followersCount: user._count.followers, followingCount: user._count.following,
  };
};

export const updateProfile = async (userId: string, data: any) => {
  const { name, username, bio, profileImage, profileImageUpdatedAt } = data;

  if (username) {
    const existing = await prisma.user.findFirst({
      where: { username, id: { not: userId } }
    });
    if (existing) {
      throw { statusCode: 409, message: 'Username is already taken' };
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(username && { username }),
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
    username: user.username,
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
    const username = await generateUniqueUsername(name);
    user = await prisma.user.create({
      data: {
        email,
        name,
        username,
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
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
      postsCount: user._count.posts, followersCount: user._count.followers, followingCount: user._count.following
    },
    token
  };
};

export const checkUserType = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }
  
  const isGoogle = !user.passwordHash && !!user.googleId;
  return { isGoogle };
};

export const verifyOldPassword = async (data: any) => {
  const { email, oldPassword } = data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.passwordHash) {
    throw { statusCode: 404, message: 'User not found or no local password' };
  }

  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Incorrect old password' };
  }

  return { message: 'Old password verified' };
};

export const changePassword = async (data: any) => {
  const { email, oldPassword, newPassword } = data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }

  if (!user.passwordHash) {
    throw { statusCode: 400, message: 'This account does not have a local password. Please use Google login.' };
  }

  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Incorrect old password' };
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { message: 'Password updated successfully' };
};
