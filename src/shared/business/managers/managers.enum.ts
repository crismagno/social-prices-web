namespace ManagersEnum {
  export enum Level {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    SUB_MANAGER = "SUB_MANAGER",
  }

  export const LevelLabels = {
    [Level.ADMIN]: "manager.levelAdmin",
    [Level.MANAGER]: "manager.levelManager",
    [Level.SUB_MANAGER]: "manager.levelSubManager",
  };

  export const LevelColors = {
    [Level.ADMIN]: "red",
    [Level.MANAGER]: "blue",
    [Level.SUB_MANAGER]: "green",
  };
}

export default ManagersEnum;
