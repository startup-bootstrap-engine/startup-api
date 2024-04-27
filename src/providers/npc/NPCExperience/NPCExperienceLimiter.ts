import { INPC } from "@entities/ModuleNPC/NPCModel";
import { provide } from "inversify-binding-decorators";

@provide(NPCExperienceLimiter)
export class NPCExperienceLimiter {
  public isXpInRange(target: INPC): boolean {
    if (!target.experience || !target.xpToRelease) return false;

    const totalXpRequired = target.xpToRelease.reduce((acc, curr) => acc + curr.xp, 0);

    // this validation allows to return experience less than max experience given by a creature and is wrong
    return totalXpRequired <= target.experience;
  }

  public compareAndProcessRightEXP(target: INPC): INPC {
    if (target.experience && target.xpToRelease && !this.isXpInRange(target)) {
      target.xpToRelease[0].xp = target.experience;
      return target;
    }

    return target;
  }
}
