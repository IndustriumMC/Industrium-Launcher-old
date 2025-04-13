<recipetype:create:crushing>.removeByName("create:crushing/tuff");
<recipetype:create:crushing>.removeByName("create:crushing/tuff_recycling");

<recipetype:create:crushing>.addRecipe(
    "cbi/crush_tuff", 
    [
        <item:minecraft:flint> % 25, 
        <item:minecraft:iron_nugget> % 10, 
        <item:create:copper_nugget> % 20, 
        <item:create:zinc_nugget> % 20, 
        <item:minecraft:gold_nugget> % 10
    ], 
    <item:minecraft:tuff>
);
