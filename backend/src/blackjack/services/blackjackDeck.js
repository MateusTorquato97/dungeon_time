/**
 * Classe que representa o baralho de cartas para o jogo de Blackjack
 */
export class BlackjackDeck {
    constructor(numberOfDecks = 6) {
        this.numberOfDecks = numberOfDecks;
        this.initialize();
    }

    /**
     * Inicializa o baralho
     */
    initialize() {
        this.cards = [];
        const suits = ['♥', '♦', '♣', '♠'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

        // Cria múltiplos baralhos
        for (let d = 0; d < this.numberOfDecks; d++) {
            for (const suit of suits) {
                for (const value of values) {
                    this.cards.push({
                        suit,
                        value,
                        displayValue: this.getDisplayValue(value)
                    });
                }
            }
        }

        this.shuffle();
    }

    /**
     * Retorna o valor de exibição da carta
     */
    getDisplayValue(value) {
        switch (value) {
            case 'J': return 'Valete';
            case 'Q': return 'Dama';
            case 'K': return 'Rei';
            case 'A': return 'Ás';
            default: return value;
        }
    }

    /**
     * Embaralha o baralho
     */
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    /**
     * Tira uma carta do topo do baralho
     */
    drawCard() {
        // Se o baralho está vazio, reinicializa
        if (this.cards.length === 0) {
            this.initialize();
        }

        return this.cards.pop();
    }

    /**
     * Retorna o número de cartas restantes no baralho
     */
    remaining() {
        return this.cards.length;
    }
}