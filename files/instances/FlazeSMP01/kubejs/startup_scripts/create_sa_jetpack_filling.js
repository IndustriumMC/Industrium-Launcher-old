/*
  For use with KubeJS. Allows for filling jetpacks and tanks via Spouts in Create.
  Also depends on PowerfulJS.
  
  Save this as a startup_script in your KubeJS directory.
  
  Capacity is mapped in a way that is equivalent to manual filling, e.g. each bucket
  fills by 100.0 "units", so a small tank requires 8 buckets to fill, and a large
  tank requires 32 buckets to fill.
  
  You'll also need to create two new fluid tags, `create_sa:jetpack_water` and 
  `create_sa:jetpack_fuel`. Basic versions of the files needed are included, you can
  add these to the kubejs/data/create_sa/tags/fluids directory.
*/

var tanks = [
    {'id': 'create_sa:small_filling_tank', 'type': 'water', 'capacity': 8000},
    {'id': 'create_sa:medium_filling_tank', 'type': 'water', 'capacity': 16000},
    {'id': 'create_sa:large_filling_tank', 'type': 'water', 'capacity': 32000},
    {'id': 'create_sa:small_fueling_tank', 'type': 'fuel', 'capacity': 8000},
    {'id': 'create_sa:medium_fueling_tank', 'type': 'fuel', 'capacity': 16000},
    {'id': 'create_sa:large_fueling_tank', 'type': 'fuel', 'capacity': 32000},
]

var jetpacks = [
    {'id': 'create_sa:andesite_jetpack_chestplate', 'type': 'fuel'},
    {'id': 'create_sa:brass_jetpack_chestplate', 'type': 'both'},
    {'id': 'create_sa:copper_jetpack_chestplate', 'type': 'water'},
]

ItemEvents.modification(event => {
    tanks.forEach((tank) => {
        event.modify(tank['id'], (item) => {
            item.attachCapability(
                CapabilityBuilder.FLUID.customItemStack()
                    .withCapacity(tank['capacity'])
                    .onFill((container, fluid, simulate) => {
                        if (tank['type'] == 'water' && !fluid.hasTag(`create_sa:jetpack_water`)) {
                            return 0
                        } else if (tank['type'] == 'fuel' && !fluid.hasTag(`create_sa:jetpack_fuel`)) {
                            return 0
                        }

                        let nbt = container.getOrCreateTag()
                        let stock = nbt.getDouble('tagStock') * 10.0
                        let amount = fluid.getAmount()

                        if (fluid.hasTag(`create_sa:jetpack_fuel`) && tank['type'] == 'fuel') {
                            // TODO: Strong and weak fuels

                            /* if (fluid.hasTag(`create_sa:weak_jetpack_fuel`)) {
                                amount /= 2
                            } else if (fluid.hasTag(`create_sa:strong_jetpack_fuel`)) {
                                amount *= 2
                            } */
                        }

                        let filled = Math.min(amount, tank['capacity'] - stock)
                        if (!simulate) {
                            nbt.putDouble('tagStock', (stock + filled) / 10.0)
                            container.setNbt(nbt)
                        }
                        return filled
                    })
            )
        })
    })

    jetpacks.forEach((jetpack) => {
        event.modify(jetpack['id'], (item) => {
            item.attachCapability(
                CapabilityBuilder.FLUID.customItemStack()
                    .withCapacity(16000)
                    .onFill((container, fluid, simulate) => {
                        let nbtKey = null

                        if ((jetpack['type'] == 'water' || jetpack['type'] == 'both') && fluid.hasTag(`create_sa:jetpack_water`)) {
                            nbtKey = 'tagWater'
                        } else if ((jetpack['type'] == 'fuel' || jetpack['type'] == 'both') && fluid.hasTag(`create_sa:jetpack_fuel`)) {
                            nbtKey = 'tagFuel'
                        } else {
                            return 0
                        }

                        let nbt = container.getOrCreateTag()
                        let stock = nbt.getDouble(nbtKey) * 10.0
                        let amount = fluid.getAmount()
                        let filled = Math.min(amount, 16000 - stock)
                        if (!simulate) {
                            nbt.putDouble(nbtKey, (stock + filled) / 10.0)
                            container.setNbt(nbt)
                        }
                        return filled
                    })
            )
        })
    })
})