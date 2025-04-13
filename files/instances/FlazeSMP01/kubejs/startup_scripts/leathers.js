function createRefinedLeatherRecipeItem(event, id, displayName, texture) {
    event.create(id)
    .displayName(displayName)
    .texture(texture)
    .maxStackSize(64)
    .tag('forge:leather')
    .tag('minecraft:miscellaneous/materials')
}

StartupEvents.registry('item', event => {
    // Refined Leather
    createRefinedLeatherRecipeItem(
        event, 
        'refined_leather', 
        'Refined Leather', 
        'kubejs:item/refined_leather', 
    );

    // High-quality leather
    createRefinedLeatherRecipeItem(
        event, 
        'hq_leather', 
        'High-quality Leather', 
        'kubejs:item/hq_leather', 
    );
});