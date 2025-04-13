ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event
  
    // Pour le mode survie
    event.register(Commands.literal('gms')
    .executes(c => setGamemode(c.source.player, c.source.player, "survival"))
    .then(Commands.argument('target', Arguments.PLAYER.create(event))
      .executes(c => setGamemode(c.source.player, Arguments.PLAYER.getResult(c, 'target'), "survival"))
  ));
  event.register(Commands.literal('gmc')
    .executes(c => setGamemode(c.source.player, c.source.player, "creative"))
    .then(Commands.argument('target', Arguments.PLAYER.create(event))
      .executes(c => setGamemode(c.source.player, Arguments.PLAYER.getResult(c, 'target'), "creative"))
  ));
  event.register(Commands.literal('gmsp')
    .executes(c => setGamemode(c.source.player, c.source.player, "spectator"))
    .then(Commands.argument('target', Arguments.PLAYER.create(event))
      .executes(c => setGamemode(c.source.player, Arguments.PLAYER.getResult(c, 'target'), "spectator"))
  ));
  
    let setGamemode = (player,target,gamemode) => {
      player.runCommand(`/gamemode ${gamemode} ${target.name.getString()}`);
      return 1
    }
  })