/**
 * Truncates a value to `head…tail` for compact display.
 *
 * Returns the original value when it's shorter than the head+tail window
 * (or empty) so we never render a `0x12...0x34` looking string for short input.
 */
const truncate = (value: string, head: number, tail: number): string => {
  if (!value) return "";
  if (value.length <= head + tail) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
};

/** Truncates an Ethereum address as `0x1234…abcd` (6 / 4 split). */
export const truncateAddress = (address: string): string =>
  truncate(address, 6, 4);

/** Truncates a CID as `abcdef…uvwxyz` (6 / 6 split). */
export const truncateCid = (cid: string): string => truncate(cid, 6, 6);
