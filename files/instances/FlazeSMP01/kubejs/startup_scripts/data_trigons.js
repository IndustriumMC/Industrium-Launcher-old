function createDataTrigonItem(event, id, displayName, texture, tooltipLines, rarity) {
    event.create(id)
    .displayName(displayName)
    .texture(texture)
    .maxStackSize(1)
    .tooltip(tooltipLines[0])
    .tooltip(tooltipLines[1])
    .tooltip(tooltipLines[2])
    .tooltip(tooltipLines[3])
    .tooltip(tooltipLines[4])
    .tag('data_trigon')
    .tag(`data_trigon_${rarity.toLowerCase()}`);
}

StartupEvents.registry('item', event => {
    // Common Data Tablet
    createDataTrigonItem(
        event, 
        'data_trigon_t1', 
        '§aCommon Data Tablet', 
        'kubejs:item/pocket_data', 
        ['A basic dataset infused with light energy,', 'commonly used for crafting entry-level', 'end-game items.', '§r', '§7- §fRarity: §a§lCOMMON'],
        'common'
    );

    // Rare Data Tablet
    createDataTrigonItem(
        event, 
        'data_trigon_t2', 
        '§9Rare Data Capsule', 
        'kubejs:item/pocket_data2', 
        ['A rare dataset radiating a blue light,', 'typically used for crafting mid-tier items', 'with higher technological value.', '§r', '§7- §fRarity: §9§lRARE'],
        'rare'
    );

    // Epic Data Cell
    createDataTrigonItem(
        event, 
        'data_trigon_t3', 
        '§5Epic Data Cell', 
        'kubejs:item/pocket_data3', 
        ['An epic dataset emitting purple energy,', 'necessary for crafting advanced and', 'complex items of great power.', '§r', '§7- §fRarity: §5§lEPIC'],
        'epic'
    );

    // Legendary Data Cell
    createDataTrigonItem(
        event, 
        'data_trigon_t4', 
        '§6Legendary Data Cell', 
        'kubejs:item/pocket_data4', 
        ['A legendary dataset that pulses with golden', 'energy, used for crafting the most powerful and', 'end-game items.', '§r', '§7- §fRarity: §6§lLEGENDARY'],
        'legendary'
    );

    // Artefact Data Cell
    createDataTrigonItem(
        event, 
        'data_trigon_t5', 
        '§f§lArtefact Data Cell', 
        'kubejs:item/pocket_data5', 
        ['An artifact-level dataset that glows with an ethereal', 'light, holding immense power to craft the rarest and', 'most coveted end-game items.', '§r', '§7- §fRarity: §f§lARTEFACT'],
        'artefact'
    );
});
