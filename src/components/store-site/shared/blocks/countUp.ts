/**
 * A number typed by the owner ("1.200", "4,9", "R$ 2,5 mi", "700k+"), split so
 * it can be counted up keeping its own look: the words around it, its
 * thousands mark and its decimals.
 */
export interface INumberParts {
  before: string;
  value: number;
  decimals: number;
  decimalMark: "," | "." | null;
  thousandsMark: "," | "." | null;
  after: string;
}

/** The first number in the text, or null when it has none to count. */
export const splitNumber = (text: string): INumberParts | null => {
  const match: RegExpExecArray | null = /\d(?:[\d.,]*\d)?/.exec(text);

  if (!match) {
    return null;
  }

  const raw: string = match[0];

  // "24/7", "10:30", "1-2": not a quantity, it stays as typed.
  if (/^[/:\-x]\s*\d/i.test(text.slice(match.index + raw.length))) {
    return null;
  }
  const lastMark: number = Math.max(raw.lastIndexOf(","), raw.lastIndexOf("."));

  let decimals: number = 0;
  let decimalMark: "," | "." | null = null;
  let thousandsMark: "," | "." | null = null;
  let integerPart: string = raw;

  if (lastMark >= 0) {
    const mark = raw[lastMark] as "," | ".";
    const tail: string = raw.slice(lastMark + 1);

    if (tail.length === 3) {
      // "1.200": groups of three are thousands.
      thousandsMark = mark;
    } else if (tail.length <= 2) {
      decimalMark = mark;
      decimals = tail.length;
      integerPart = raw.slice(0, lastMark);
      thousandsMark = integerPart.includes(mark === "," ? "." : ",")
        ? mark === ","
          ? "."
          : ","
        : null;
    } else {
      return null;
    }
  }

  const groups: string[] = thousandsMark
    ? integerPart.split(thousandsMark)
    : [integerPart];

  // A mark in the wrong place ("1.2.3") is not a number to count.
  if (
    groups.some((group: string) => !/^\d+$/.test(group)) ||
    groups.slice(1).some((group: string) => group.length !== 3)
  ) {
    return null;
  }

  const fraction: string = decimals ? raw.slice(lastMark + 1) : "";

  return {
    before: text.slice(0, match.index),
    value: Number(`${groups.join("")}${fraction ? `.${fraction}` : ""}`),
    decimals,
    decimalMark,
    thousandsMark,
    after: text.slice(match.index + raw.length),
  };
};

/** The number written the way the owner wrote theirs. */
export const formatLike = (parts: INumberParts, value: number): string => {
  const [integer, fraction] = value.toFixed(parts.decimals).split(".");

  const grouped: string = parts.thousandsMark
    ? integer.replace(/\B(?=(\d{3})+(?!\d))/g, parts.thousandsMark)
    : integer;

  return `${parts.before}${grouped}${
    fraction ? `${parts.decimalMark ?? "."}${fraction}` : ""
  }${parts.after}`;
};
