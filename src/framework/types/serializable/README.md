# core (serializable) types

## Terms

### Card

The specification for a type of unit, hero, building, spell, or upgrade that can exist in the game.
Includes normal cards that would be found in the hand and deck; token units that only exist while they are in play; and even the definitions of core buildings like the base, add-ons, and tech buildings.

In spite of the name, there is only one `Card` for each type of object in the game.
For example, the "cards" in players' hands and decks are simply references to the real `Card` definitions, as are any `Instance`s of these cards that are in play.

### Instance

The materialization of a `Card` that is in play.
There can be any number of `Instance`s in play for any given `Card`.
Each `Instance` is a binding to a `Card` combined with a bunch of state (such as whether the `Instance` is exhausted and how many damage counters it has).

### ResolvableEffect

Any pending event in the game that has been enqueued by the execution of some other game mechanic.

`ResolvableEffect`s may be parameterized, meaning that there is some decision for the active player to make.
For example, one effect that involves no decisions may be to "remove this specific Instance from play", whereas a more complex effect may be for the active player to "choose an `Instance` matching these criteria to deal damage to".

As long as at least one `ResolvableEffect` is pending queue, the active player cannot take any new-new actions (such as playing a new card or using an additional `ActivatedAbility`).
However, the active player has full authority to determine the order in which any pending `ResolvableEffect`s are executed, even if these then spawn yet more new effects.
This facilitates the rule that the active player always determines the order of simultaneous events.

Because any game event has the possibility of triggering multiple effects simultaneously (which could require player decision), generally every change to game state will always happen via a `ResolvableEffect`.

### Property

Any type of ability, statistic, or keyword attached to an `Instance`, including `ActivatedAbility`s, `Attribute`s, `Tag`s, `Trait`s, and `TriggeredAbility`s.
Properties can be granted by the `Instance`'s own `Card`, or by `Modifier`s that have been applied to the `Instance`.

### Trait

A keyword that has engine-level functionality.
For example, `"LEGENDARY"` forbids any player from controlling more than one `Instance` of the same `Card`.

### Tag

A keyword that has no engine-level functionality.
`Tag`s can still have functionality added to them by cards.
For example, `Instance`s tagged with `"Ninja"` are empowered by Jade Fox.

### Attribute

A numeric statistic of an `Instance` that can be contributed to by multiple modifications, such as `"ARMOR 1"`.
Attack strength and maximum health are attributes.

### TriggeredAbility

An ability of an `Instance` which executes in response to some game event and generates `ResolvableEffect`s.
For example, Bloodrage Ogre has a `TriggeredAbility` which automatically returns him to his owner hand under certain circumstances.

### ActivatedAbility

An ability of an `Instance` which can be manually executed by the player during their turn by paying some cost.
For example, Careless Musketeer has an `ActivatedAbility` which allows him to damage any unit or building.
