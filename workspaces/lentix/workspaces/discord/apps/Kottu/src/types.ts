/**
 * Data for a taboo card
 */
export interface ITabooCard {
    word: string;
    banned: string[];
}
/**
 * Data for a player in a game of CAH
 */
export interface ICardsAgainstHumanityPlayerData {
    id: string;
    submission: string;
    points: boolean;
    choices: string[];
}
/**
 * Data for a game of CAH
 */
export interface ICardsAgainstHumanityGame {
    guild: string;
    players: ICardsAgainstHumanityGame[];
    phrase: string;
}
/**
 * Data for a player in a game of Taboo
 */
export interface ITabooPlayerData {
    id: string;
    points: number;
}
/**
 * Data for a game of taboo
 */
export interface ITabooGame {
    guild: string;
    players: ITabooPlayerData[];
    card: ITabooCard;
}
