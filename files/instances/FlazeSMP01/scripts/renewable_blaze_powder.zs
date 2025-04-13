import mods.create.MillingManager;

// Renewable Blaze Powder via Milling
<recipetype:create:milling>.addRecipe(
    "renewable_blaze_powder",              // Recipe ID
    [                                      // Outputs
        <item:minecraft:blaze_powder> % 50, // 50% chance for Blaze Powder
        <item:minecraft:nether_wart> % 30  // 30% chance to get back Nether Wart
    ],
    <item:minecraft:nether_wart>,         // Input: Nether Wart
    200                                   // Duration: 100 ticks (5 seconds)
);
