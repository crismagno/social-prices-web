export const sleep = async (ms: number = 0): Promise<any> =>
  new Promise((r) => setTimeout(r, ms));

export const makeRandomCode = (lengthCode: number = 6): string => {
  let result: string = "";

  const characters: string = `${process.env.NEXT_PUBLIC_CHARACTERS}`;

  const charactersLength: number = characters.length;

  for (let i = 0; i < lengthCode; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result.toUpperCase();
};

export const makeRandom = (): string => {
  const randomNumber: number = Math.floor(
    1000000000 + Math.random() * 9000000000
  );

  return randomNumber.toString();
};
