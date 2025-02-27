// Lógica do jogo de Blackjack

// Valores das cartas
const CARD_VALUES = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

// Naipes
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];

class BlackjackGameLogic {
    // Gera um novo baralho embaralhado
    createDeck() {
        const deck = [];
        for (const suit of SUITS) {
            for (const value of Object.keys(CARD_VALUES)) {
                deck.push({ suit, value });
            }
        }
        return this.shuffleDeck(deck);
    }

    // Embaralha o baralho usando o algoritmo Fisher-Yates
    shuffleDeck(deck) {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Distribui as cartas iniciais (2 cartas para cada jogador e dealer)
    dealInitialCards(deck, numPlayers) {
        const playerHands = Array(numPlayers).fill().map(() => []);
        const dealerHand = [];

        // Distribui a primeira carta para cada jogador
        for (let i = 0; i < numPlayers; i++) {
            playerHands[i].push(deck.pop());
        }
        // Distribui a primeira carta para o dealer
        dealerHand.push(deck.pop());

        // Distribui a segunda carta para cada jogador
        for (let i = 0; i < numPlayers; i++) {
            playerHands[i].push(deck.pop());
        }
        // Distribui a segunda carta para o dealer
        dealerHand.push(deck.pop());

        return {
            playerHands,
            dealerHand,
            remainingDeck: deck
        };
    }

    // Calcula o valor da mão (trata Áses como 1 ou 11)
    calculateHandValue(hand) {
        let value = 0;
        let aces = 0;

        for (const card of hand) {
            if (card.value === 'A') {
                aces++;
                value += 11;
            } else {
                value += CARD_VALUES[card.value];
            }
        }

        // Ajusta o valor dos Áses
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }

        return value;
    }

    // Verifica se a mão é um blackjack (21 com 2 cartas)
    isBlackjack(hand) {
        return hand.length === 2 && this.calculateHandValue(hand) === 21;
    }

    // Verifica se a mão estourou (acima de 21)
    isBusted(hand) {
        return this.calculateHandValue(hand) > 21;
    }

    // Dealer joga de acordo com as regras (pede carta até 17 ou mais)
    playDealer(deck, dealerHand) {
        const newDealerHand = [...dealerHand];
        let remainingDeck = [...deck];

        while (this.calculateHandValue(newDealerHand) < 17) {
            newDealerHand.push(remainingDeck.pop());
        }

        return {
            dealerHand: newDealerHand,
            remainingDeck
        };
    }

    // Determina o vencedor (compara as mãos do jogador e do dealer)
    determineResult(playerHand, dealerHand) {
        const playerValue = this.calculateHandValue(playerHand);
        const dealerValue = this.calculateHandValue(dealerHand);

        // Jogador estourou
        if (playerValue > 21) return 'perdeu';

        // Verifica blackjack
        const playerBlackjack = this.isBlackjack(playerHand);
        const dealerBlackjack = this.isBlackjack(dealerHand);

        if (playerBlackjack && dealerBlackjack) return 'empatou';
        if (playerBlackjack) return 'blackjack';
        if (dealerBlackjack) return 'perdeu';

        // Dealer estourou
        if (dealerValue > 21) return 'ganhou';

        // Compara valores
        if (playerValue > dealerValue) return 'ganhou';
        if (playerValue < dealerValue) return 'perdeu';
        return 'empatou';
    }

    // Calcula o pagamento com base na aposta e no resultado
    calculatePayout(bet, result) {
        switch (result) {
            case 'blackjack':
                return Math.floor(bet * 2.5); // Pagamento 3:2 para blackjack
            case 'ganhou':
                return bet * 2; // Pagamento 1:1 para vitória
            case 'empatou':
                return bet; // Devolve a aposta original para empate
            case 'surrender':
                return Math.floor(bet / 2); // Devolve metade da aposta para surrender
            default:
                return 0; // Aposta perdida
        }
    }
}

export const blackjackGameLogic = new BlackjackGameLogic();