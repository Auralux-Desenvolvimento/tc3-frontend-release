import generateDateFromInput from "./generateDateFromInput";

export default function validateAge (_birthday?: string) {
  if (!_birthday) {
    return false;
  }
  const birthday = generateDateFromInput(_birthday);
  const minAge = new Date();
  minAge.setFullYear(minAge.getFullYear() - 15);
  return !!birthday && birthday.getTime() <= minAge.getTime();
}