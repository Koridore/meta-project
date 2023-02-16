import dotenv from 'dotenv';
dotenv.config();
interface ENV {
    TOKEN: string | undefined;
    CLIENT_ID: string | undefined;
    GUILD_ID: string | undefined;
    PRODUCTION: boolean | undefined;
    BUG_REPORT_ID: string | undefined;
    OWNER_ID: string | undefined;
}
/**
 * gets object of environment variables
 */
const getConfig = (): ENV => {
    return {
        TOKEN: process.env.TOKEN,
        CLIENT_ID: process.env.CLIENT_ID,
        GUILD_ID: process.env.GUILD_ID,
        BUG_REPORT_ID: process.env.BUG_REPORT_ID,
        PRODUCTION: process.env.PRODUCTION === 'true',
        OWNER_ID: process.env.OWNER_ID,
    };
};
/**
 * Returns environment variables with camelCase keys;
 * @returns {Object}
 */
const getParsedConfig = () => {
    const config = getConfig();
    return {
        token: config.TOKEN,
        bugReportId: config.BUG_REPORT_ID,
        guildId: config.GUILD_ID,
        clientId: config.CLIENT_ID,
        production: config.PRODUCTION,
        ownerId: config.OWNER_ID,
    };
};
export default { getConfig, getParsedConfig };
