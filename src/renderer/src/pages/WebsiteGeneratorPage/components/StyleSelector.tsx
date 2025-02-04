import React from 'react'
import { Dropdown } from 'flowbite-react'
import { Style } from '../templates'

interface StyleSelectorProps {
  currentStyle: Style
  styles: Style[]
  onSelect: (style: Style) => void
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ currentStyle, styles, onSelect }) => {
  return (
    <Dropdown label={currentStyle.label} dismissOnClick={true} size="xs" color={'indigo'}>
      {styles?.map((style) => (
        <Dropdown.Item key={style.value} onClick={() => onSelect(style)}>
          {style.label}
        </Dropdown.Item>
      ))}
    </Dropdown>
  )
}
