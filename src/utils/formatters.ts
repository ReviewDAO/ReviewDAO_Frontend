import { ethers } from 'ethers'

/**
 * 格式化INJ代币数量显示
 * @param value - 以wei为单位的数值
 * @param decimals - 显示的小数位数，默认为4
 * @returns 格式化后的字符串，带INJ单位
 */
export function formatINJ(value: string | bigint | number, decimals: number = 4): string {
  try {
    const formatted = ethers.formatEther(value.toString())
    const num = parseFloat(formatted)
    return `${num.toFixed(decimals)} INJ`
  } catch (error) {
    console.error('Error formatting INJ value:', error)
    return '0.0000 INJ'
  }
}

/**
 * 格式化INJ代币数量显示（不带单位）
 * @param value - 以wei为单位的数值
 * @param decimals - 显示的小数位数，默认为4
 * @returns 格式化后的数字字符串
 */
export function formatINJValue(value: string | bigint | number, decimals: number = 4): string {
  try {
    const formatted = ethers.formatEther(value.toString())
    const num = parseFloat(formatted)
    return num.toFixed(decimals)
  } catch (error) {
    console.error('Error formatting INJ value:', error)
    return '0.0000'
  }
}

/**
 * 解析INJ代币数量为wei
 * @param value - INJ数量字符串
 * @returns 以wei为单位的bigint
 */
export function parseINJ(value: string): bigint {
  try {
    return ethers.parseEther(value)
  } catch (error) {
    console.error('Error parsing INJ value:', error)
    return 0n
  }
}