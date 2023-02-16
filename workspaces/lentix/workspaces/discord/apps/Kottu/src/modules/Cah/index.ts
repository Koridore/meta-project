import { Kottu, Module } from '@struct';

export default class CardsAgainstHumanity extends Module {
    public module: string;
    public friendlyName: string;
    constructor(kottu: Kottu) {
        super(kottu);
        this.module = 'cardsagainsthumanity';
        this.friendlyName = 'Cards Against Humanity';
    }
}
