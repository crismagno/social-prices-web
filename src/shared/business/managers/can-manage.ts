import ManagersEnum from "./managers.enum";

const LEVEL_WEIGHT: Record<ManagersEnum.Level, number> = {
  [ManagersEnum.Level.ADMIN]: 3,
  [ManagersEnum.Level.MANAGER]: 2,
  [ManagersEnum.Level.SUB_MANAGER]: 1,
};

export const canManage = (
  actorLevel: ManagersEnum.Level,
  targetLevel: ManagersEnum.Level
): boolean => {
  if (actorLevel === ManagersEnum.Level.ADMIN) {
    return true;
  }

  if (actorLevel === ManagersEnum.Level.MANAGER) {
    return LEVEL_WEIGHT[targetLevel] < LEVEL_WEIGHT[ManagersEnum.Level.MANAGER];
  }

  return false;
};
