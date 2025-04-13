<?php
$instance['FlazeSMP01'] = array_merge($instance['FlazeSMP01'], array(
    "loadder" => array(
        "minecraft_version" => "1.20.1",
        "loadder_type" => "forge",
        "loadder_version" => "latest"
    ),
    "verify" => false,
    "ignored" => array(
        'crash-reports'
        'essential',
        'logs',
        'resourcepacks',
        'saves',
        'screenshots',
        'shaderpacks',
        'W-OVERFLOW',
        'options.txt',
        'optionsof.txt'
    ),
    "whitelist" => array(),
    "whitelistActive" => false,
    "status" => array(
        "nameServer" => "Flaze SMP",
        "ip" => "mc.benzoogataga.com",
        "port" => ""
    )
));
?>
