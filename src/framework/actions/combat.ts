import { GameState, InstanceID } from "../types";
import {
  canAttack,
  getAttack,
  getHealth,
  getPossibleAttackTargets,
} from "../queries/combat";
import { getInstance, getPlayer } from "../queries/common";

export const attackInstance = (
  $: GameState,
  attackerId: InstanceID,
  defenderId: InstanceID,
): void => {
  const attacker = getInstance($, attackerId);
  const defender = getInstance($, defenderId);
  if (!attacker) {
    throw new Error(`id ${attackerId} is not an instance`);
  }
  if (!defender) {
    throw new Error(`id ${defenderId} is not an instance`);
  }

  if (!canAttack($, attackerId)) {
    throw new Error(`instance ${attackerId} can't attack`);
  }

  if (!getPossibleAttackTargets($, attackerId).includes(defenderId)) {
    throw new Error(`instance ${attackerId} can't attack instance\
 ${defenderId}`);
  }

  defender.damage += getAttack($, attackerId);
  attacker.damage += getAttack($, defenderId);

  if (getHealth($, attackerId) <= 0) {
    killInstance($, attackerId);
  }

  if (getHealth($, defenderId) <= 0) {
    killInstance($, defenderId);
  }
};

const killInstance = (
  $: GameState,
  iid: InstanceID,
): void => {
  const I = getInstance($, iid);
  if (!I) {
    throw new Error(`id ${iid} is not an instance`);
  }

  if (I.card) {
    const owner = getPlayer($, I.owner);
    if (owner) {
      owner.discard.push(I.card);
    }
  }

  delete $.instances[iid];
};
