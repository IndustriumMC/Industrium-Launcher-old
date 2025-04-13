craftingTable.removeByName("sophisticatedbackpacks:backpack");
craftingTable.remove(<item:sophisticatedbackpacks:copper_backpack>);
craftingTable.remove(<item:sophisticatedbackpacks:iron_backpack>);

craftingTable.addShaped(
    "cbi/backpack",
    <item:sophisticatedbackpacks:backpack>, 
    [
        [<item:kubejs:refined_leather>, <tag:items:forge:chests>, <item:kubejs:refined_leather>],
        [<item:quark:bonded_leather>, <item:minecraft:string>, <item:quark:bonded_leather>],
        [<item:minecraft:leather>, <item:minecraft:iron_ingot>, <item:minecraft:leather>]
    ]
);
craftingTable.addShaped(
    "cbi/copper_backpack",
    <item:sophisticatedbackpacks:copper_backpack>, 
    [
        [<item:kubejs:refined_leather>, <tag:items:forge:chests>, <item:kubejs:refined_leather>],
        [<item:quark:bonded_leather>, <item:sophisticatedbackpacks:backpack>, <item:quark:bonded_leather>],
        [<item:kubejs:refined_leather>, <item:minecraft:copper_block>, <item:kubejs:refined_leather>]
    ]
);
craftingTable.addShaped(
    "cbi/iron_backpack",
    <item:sophisticatedbackpacks:iron_backpack>, 
    [
        [<item:kubejs:hq_leather>, <tag:items:forge:chests>, <item:kubejs:hq_leather>],
        [<item:quark:bonded_leather>, <item:sophisticatedbackpacks:copper_backpack>, <item:quark:bonded_leather>],
        [<item:kubejs:hq_leather>, <item:minecraft:iron_block>, <item:kubejs:hq_leather>]
    ]
);