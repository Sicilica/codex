import { Card } from '../src/framework/types';

export const lookupCard = (
  name: string,
): Card => {
  // TODO
  switch (name) {
  case 'Nautical Dog':
    return {
      type: 'UNIT',
      color: 'RED',
      spec: null,
      tech: 0,
      cost: 1,
      attack: 1,
      health: 1,
      tags: ['DOG'],
      legendary: false,
      token: false,
      abilities: ['TODO'],
      name: 'Nautical Dog',
      boostCost: null,
    };
  default:
    throw new Error(`unknown card: ${name}`);
  }
};
