export const sleep = async (ms: number = 0): Promise<any> =>
  new Promise((r) => setTimeout(r, ms));
