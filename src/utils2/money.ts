export function formatUsdt(number: number) {
  const newNumber = parseFloat(number)

  return newNumber.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
export function formatVnd(number: number) {
  const newNumber = parseInt(number)

  return newNumber.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}
export async function usdToVnd(number: number) {
  const reponse = await fetch('https://api.exchangerate-api.com/v4/latest/USDT')
  const data = await reponse.json()
  const usdToVndRate = data.rates.VND

  // Thực hiện chuyển đổi từ USDT sang VND
  const usdtAmount = number // Số tiền USDT cần chuyển đổi

  return usdtAmount * usdToVndRate
}
export async function vndToUsd(number = 0) {
  const reponse = await fetch('https://api.exchangerate-api.com/v4/latest/USDT')
  const data = await reponse.json()
  const usdToVndRate = data.rates.VND

  // Thực hiện chuyển đổi từ USDT sang VND
  const usdtAmount = number // Số tiền USDT cần chuyển đổi

  return usdtAmount / usdToVndRate
}
