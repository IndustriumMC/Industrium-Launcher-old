ServerEvents.tags('item', (event) => {
    event.removeAll('forge:ingots')
    Ingredient.all.itemIds.forEach(itemId => {
        if (itemId.toString().includes('ingot')) {
            event.add('forge:ingots', itemId);
        }
    });

    const ingots = event.get('balm:ingot').getObjectIds();
    ingots.forEach(ingot => {
        event.add('forge:ingots', ingot);
    });
});
