import React, { useState, useEffect } from 'react'
import { getLevelFromExp, getLevelColor } from '../utils/levelSystem'
import { useTheme } from '../context/ThemeContext'
import './LevelBadge.css'

// RGB转HSL - 移到组件外部，避免每次渲染重新创建
const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
      default: h = 0
    }
  }
  
  return [h, s, l]
}

// 解析主题色的HSL值 - 移到组件外部
const getThemeHue = (themeColor) => {
  const hex = themeColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const hsl = rgbToHsl(r, g, b)
  return hsl[0] * 360 // 转换为0-360度
}

const LevelBadge = ({ exp, size = 'normal' }) => {
  const level = getLevelFromExp(exp)
  const isMaxLevel = level >= 70
  const [rainbowStyle, setRainbowStyle] = useState({})
  const { themeColor } = useTheme()

  // 70级主题色深浅变化渐变
  useEffect(() => {
    if (!isMaxLevel) return

    const themeHue = getThemeHue(themeColor)
    
    // 基于主题色生成深浅变体
    // 颜色1：主题色的浅色变体（亮度+20%）
    // 颜色2：主题色本身
    // 颜色3：主题色的深色变体（亮度-20%）
    const lightColor = `hsl(${themeHue}, 100%, 70%)` // 浅色变体
    const mainColor = `hsl(${themeHue}, 100%, 50%)`  // 主题色本身
    const darkColor = `hsl(${themeHue}, 100%, 30%)`  // 深色变体
    
    // 创建平滑的深浅变化渐变，固定135度角
    const gradient = `linear-gradient(135deg, 
      ${lightColor}, 
      ${mainColor}, 
      ${darkColor})`
    
    setRainbowStyle({
      background: gradient,
      // 添加平滑过渡，主题切换时效果更自然
      transition: 'background 0.5s ease'
    })
  }, [isMaxLevel, themeColor])

  const color = isMaxLevel ? null : getLevelColor(level)
  const style = isMaxLevel
    ? rainbowStyle
    : {
        backgroundColor: color,
      }

  return (
    <span
      className={`level-badge level-badge-${size} ${isMaxLevel ? 'level-max' : ''}`}
      style={style}
      title={`等级 ${level}`}
    >
      Lv.{level}
    </span>
  )
}

export default LevelBadge

