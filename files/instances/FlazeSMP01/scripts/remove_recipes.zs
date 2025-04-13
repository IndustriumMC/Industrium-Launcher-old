import crafttweaker.api.recipe.Brewing;
import mods.create.MixingManager;

// Remove Crafting Table Recipes
craftingTable.remove(<item:apotheosis:potion_charm>);
craftingTable.remove(<tag:items:curios:charm>);
craftingTable.remove(<item:apotheosis:potion_charm>.withTag({Potion: "apotheosis:flying"}));
craftingTable.remove(<item:apotheosis:potion_charm>.withTag({Potion: "apotheosis:long_flying"}));
craftingTable.remove(<item:apotheosis:potion_charm>.withTag({Potion: "apotheosis:extra_long_flying"}));
craftingTable.remove(<item:mob_grinding_utils:saw>);
craftingTable.remove(<item:ad_astra:desh_cable>);
<recipetype:create:mixing>.removeByInput(<item:minecraft:popped_chorus_fruit>);
craftingTable.remove(<item:ae2:matter_cannon>);

// Remove Potion Recipes
brewing.removeRecipeByOutputPotion(<potion:apotheosis:flying>);
brewing.removeRecipeByOutputPotion(<potion:apotheosis:long_flying>);
brewing.removeRecipeByOutputPotion(<potion:apotheosis:extra_long_flying>);