export default function truncate (string: string, maxLength: number = 15) {
  if (string.length > maxLength) {
    string = string.substring(0, maxLength) + '...';
  } else {
    string = string;
  }
  return string;
}