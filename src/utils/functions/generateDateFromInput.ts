export default function generateDateFromInput (input: string) {
  const [ year, month, day ] = input.split("-").map(e => Number(e));
  return new Date(year, month-1, day);
}