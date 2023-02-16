import { Events } from 'discord.js';
//import PrismaClient from '../prisma';
import Event from '@struct/Event';
import Kottu from '@struct/Kottu';

export default new Event(Events.ClientReady, (kottu: Kottu, client) => {
    /*
    client.guilds.cache.forEach(async (g) => {
        await PrismaClient.guild.upsert({
            where: {
                id: g.id,
            },
            update: {
                id: g.id,
            },
            create: {
                id: g.id,
                adminRole: '',
                blacklisted: false,
            },
        });
    });

    client.users.cache.forEach(async (user) => {
        if (!user.id) return;
        await PrismaClient.user.upsert({
            where: {
                id: user.id,
            },
            update: {
                id: user.id
            },
            create: {
                id: user.id,
                blacklisted: false,
                stats: '',
            },
        });
        await pause(100);
    });
    */
    kottu.logger.info(`Successfully logged in as ${client.user.tag}`);
});
