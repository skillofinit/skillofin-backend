export function getRandomId(): string {
  return Math.random().toString(36).substr(2, 20);
}

export function getOTP(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

export function getTodayDate(): string {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const hours = today.getHours();
  const minutes = today.getMinutes();
  const seconds = today.getSeconds();
  return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
}
export function getTodayDay(): number {
  const today = new Date();
  return today.getTime();
}

export function getTotalDaysInMonth(): number {
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  return new Date(year, month + 1, 0).getDate();
}

export const BASE_URL = "https://www.skillofinapi.com/api";
// export const BASE_URL = "http://localhost:3000/api";


//Stripe urls
// export const webHookRefreshUrl = "http://localhost:5174/kyc"
// export const webHookReturnUrl = "http://localhost:5174/myprofile"
export const webHookRefreshUrl = "https://www.skillofin.com//kyc"
export const webHookReturnUrl = "https://www.skillofin.com//myprofile"

