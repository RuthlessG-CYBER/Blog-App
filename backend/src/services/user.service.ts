import prisma from '../config/database';


export const toggleFollowUser = async (followerId: string, followingId: string) => {
  if (followerId === followingId) {
    throw { statusCode: 400, message: 'You cannot follow yourself' };
  }

  const targetUser = await prisma.user.findUnique({ where: { id: followingId } });
  if (!targetUser) {
    throw { statusCode: 404, message: 'User not found' };
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({ where: { id: existingFollow.id } });
    return { isFollowing: false };
  } else {
    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: followingId,
        actorId: followerId,
        type: 'follow',
      },
    });

    return { isFollowing: true };
  }
};

export const getUserProfile = async (currentUserId: string, targetUserId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }

  let isFollowing = false;
  if (currentUserId !== targetUserId) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });
    isFollowing = !!follow;
  }

  const { passwordHash, ...safeUser } = user;
  return { ...safeUser, isFollowing };
};

export const getFollowers = async (userId: string) => {
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: { id: true, name: true, username: true, profileImage: true, bio: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return followers.map(f => f.follower);
};

export const getFollowing = async (userId: string) => {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: { id: true, name: true, username: true, profileImage: true, bio: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return following.map(f => f.following);
};
