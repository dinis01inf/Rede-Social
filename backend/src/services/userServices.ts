import { prefault } from 'zod';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

export const findAllUsers = async () => {
    return await prisma.user.findMany();
};

export const createUser = async (fullName: string, email: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    return await prisma.user.create({
        data: { fullName, email, password: hashedPassword}
    });
};

export const deleteUser = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: { id }
    });

    if (!user) {
        throw new Error("UserNotFound");
    }

    return await prisma.user.delete({
        where: { id }
    });
};

export const searchUser = async (keyword: string) => {
    return await prisma.user.findMany({
        where: {
            fullName: {
                contains: keyword,
                mode: 'insensitive'
            }
        }
    });
};


export const findUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({
        where: { email }
    });
}

export const getUserById = async (id: number) => {
    return await prisma.user.findUnique({
        where: { id },
    });
};

export const getPublicUserById = async (id: number) => {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            following: true,
            followed: true,
            creatorEvents: true,
            followedEvents: true,
        }
    });
};

export const getUserFollowers = async (id : number) => {
    return prisma.userFollow.findMany({
        where:{ followingId: id },
        include: { follower : true }
    });
};

export const getUserFollowing = async (id : number) => {
    return prisma.userFollow.findMany({
        where:{ followerId: id },
        include: { following : true }
    });
};

export const getUserEvents = async (id: number) => {
    return prisma.events.findMany({
        where:{
            createdBy: id,
        }
    });
};