export const RARITY_COLORS = {
    comum: '#9e9e9e',      // Cinza
    incomum: '#4CAF50',    // Verde
    raro: '#2196F3',       // Azul
    epico: '#9C27B0',      // Roxo
    lendario: '#FFA000'    // Dourado
};

export const RARITY_GRADIENTS = {
    comum: ['#757575', '#9e9e9e'],
    incomum: ['#388E3C', '#4CAF50'],
    raro: ['#1976D2', '#2196F3'],
    epico: ['#7B1FA2', '#9C27B0'],
    lendario: ['#FFA000', '#FFD700']
};

export const getRarityFromAverage = (average) => {
    if (average >= 4.5) return 'lendario';
    if (average >= 3.5) return 'epico';
    if (average >= 2.5) return 'raro';
    if (average >= 1.5) return 'incomum';
    return 'comum';
};