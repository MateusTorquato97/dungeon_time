// Importa todas as imagens dos itens
export const itemImages = {
    // Armas
    'Espada Longa': require('../../assets/images/itens/espada_longa.png'),

    // Armaduras
    'Armadura de Couro': require('../../assets/images/itens/armadura_de_couro.png'),

    // Elmos
    'Elmo de Ferro': require('../../assets/images/itens/elmo_de_ferro.png'),

    // Luvas
    'Luvas de Ferro': require('../../assets/images/itens/luvas_de_ferro.png'),

    // Botas
    'Sapatos do Rock Lee': require('../../assets/images/itens/sapatos_rock_lee.png'),

    // Calças
    'Calças do Rock Lee': require('../../assets/images/itens/calcas_rock_lee.png'),

    // Colares
    'Colar de Couro': require('../../assets/images/itens/colar_couro.png'),

    // Anéis
    'Anel da Sorte': require('../../assets/images/itens/anel_da_sorte.png'),
};

// Função auxiliar para pegar a imagem do item
export const getItemImage = (item) => {
    if (!item) return null;
    return itemImages[item.nome] || null;
}; 