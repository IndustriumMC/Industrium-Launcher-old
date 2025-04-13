// Function to create Unobtanium Ore
function createOreItem(event, id, displayName, texture, tooltipLines) {
    event.create(id)
    .displayName(displayName)
    .texture(texture)
    .maxStackSize(64) // Ore should be stackable
    .tooltip(tooltipLines[0])
    .tooltip(tooltipLines[1])
    .tag('unobtanium_ore')
    .tag('unobtanium')
}

// Function to create Unobtanium Bar
function createBarItem(event, id, displayName, texture, tooltipLines) {
    event.create(id)
    .displayName(displayName)
    .texture(texture)
    .maxStackSize(64) // Bar can also be stackable
    .tooltip(tooltipLines[0])
    .tooltip(tooltipLines[1])
    .tag('unobtanium_bar')
    .tag('unobtanium')
}

// Function to create Unobtanium Bar
function createRecipeItem(event, id, displayName, texture, tooltipLines) {
    event.create(id)
    .displayName(displayName)
    .texture(texture)
    .maxStackSize(64) // Bar can also be stackable
    .tooltip(tooltipLines[0])
    .tooltip(tooltipLines[1])
    .tooltip(tooltipLines[2])
    .tooltip(tooltipLines[3])
    .tooltip(tooltipLines[4])
    .tag('unobtanium_recipe')
    .tag('unobtanium')
}

StartupEvents.registry('item', event => {
    // Unobtanium Compound
    createOreItem(
        event, 
        'unobtanium_compound', 
        '§7Unobtanium Compound', 
        'kubejs:item/unobtanium_compound', 
        ['A mysterious, rare compound formed from cosmic materials.', 'Only the most skilled miners can refine it into valuable items.'],
    );

    // Unobtanium Ore
    createOreItem(
        event, 
        'unobtanium_ore', 
        '§5Unobtanium Ore', 
        'kubejs:item/unobtanium_ore', 
        ['A mysterious, shimmering ore found deep underground.', 'Its ethereal glow hints at immense power locked within.'],
    );

    // Unobtanium Bar
    createBarItem(
        event, 
        'unobtanium_bar', 
        '§5Unobtanium Bar', 
        'kubejs:item/unobtanium_bar', 
        ['An incredibly dense yet lightweight bar refined', 'from unobtanium ore. Said to defy the laws of physics.'],
    );

    // Unobtanium Ore
    createRecipeItem(
        event, 
        'unobtanium_recipe', 
        '§6Unobtanium Recipe', 
        'kubejs:item/recipe', 
        ['The result of groundbreaking research', 'and advanced mining techniques, unobtanium', 'can only be refined by Tier 3 mining companies', 'with R&D capabilities. Harnessing its potential', 'requires mastery of both science and industry.'],
    );

    // You can add new items stuff here
});

StartupEvents.registry('block', event => {
    event.create('unobtanium_block') // Create a new block
      .displayName('§5Block of Unobtanium') // Set a custom name
      .soundType('metal') // Set a material (affects the sounds and some properties)
      .hardness(1.0) // Set hardness (affects mining time)
      .resistance(1.0) // Set resistance (to explosions, etc)
      .requiresTool(true) // Requires a tool or it won't drop (see tags below)
      .tagBlock('unobtanium')
      .tagBlock('unobtanium_block')
      .tagBlock('minecraft:mineable/pickaxe')
      .tagBlock('minecraft:needs_iron_tool') // the tool tier must be at least iron
  })
