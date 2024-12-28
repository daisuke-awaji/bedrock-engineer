import React, { useCallback, useState } from 'react'
import { FiLoader, FiSend, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

export type AttachedImage = {
  file: File
  preview: string
  base64: string
}

type TextAreaProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string, images: AttachedImage[]) => void
  disabled?: boolean
  isComposing: boolean
  setIsComposing: (value: boolean) => void
  sendMsgKey?: 'Enter' | 'Cmd+Enter'
}

export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isComposing,
  setIsComposing,
  sendMsgKey = 'Enter'
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.shiftKey) {
      return
    }
    if (isComposing) {
      return
    }

    const cmdenter = e.key === 'Enter' && (e.metaKey || e.ctrlKey)
    const enter = e.key === 'Enter'

    if ((sendMsgKey === 'Enter' && enter) || (sendMsgKey === 'Cmd+Enter' && cmdenter)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (value.trim() || attachedImages.length > 0) {
      onSubmit(value, attachedImages)
      setAttachedImages([]) // Reset images after submit
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const files = Array.from(e.dataTransfer.files).filter((file) => {
        const type = file.type.split('/')[1].toLowerCase()
        return ['png', 'jpeg', 'jpg', 'gif', 'webp'].includes(type)
      })

      // Check if adding new images would exceed the 5 image limit
      if (attachedImages.length + files.length > 5) {
        toast.error('Maximum of 5 images allowed')
        return
      }

      files.forEach((file) => {
        // Check file size (3.75MB limit)
        if (file.size > 3.75 * 1024 * 1024) {
          toast.error(`Image ${file.name} is too large. Maximum size is 3.75MB`)
          return
        }

        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result as string
          // Create image element to check dimensions
          const img = new Image()
          img.onload = () => {
            if (img.width > 8000 || img.height > 8000) {
              toast.error(`Image ${file.name} dimensions exceed 8000px limit`)
              return
            }
            setAttachedImages((prev) => [
              ...prev,
              {
                file,
                preview: base64,
                base64: base64.split(',')[1] // Remove data URL prefix
              }
            ])
          }
          img.src = base64
        }
        reader.readAsDataURL(file)
      })
    },
    [attachedImages.length]
  )

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="relative w-full">
      {/* Image Previews */}
      {attachedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachedImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.preview}
                alt={`Preview ${index}`}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Textarea with drag and drop */}
      <div
        className={`relative ${dragActive ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
        onDragEnter={handleDrag}
      >
        <textarea
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          className={`block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:text-white dark:bg-gray-800 ${
            dragActive ? 'border-blue-500' : ''
          }`}
          placeholder="Type your message or drag & drop images here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => !disabled && handleKeyDown(e)}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          required
          rows={3}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className={`absolute end-2.5 bottom-2.5 rounded-lg ${
            disabled ? '' : 'hover:bg-gray-200'
          } px-2 py-2 dark:text-white dark:hover:bg-gray-700`}
        >
          {disabled ? (
            <FiLoader className="text-xl animate-spin" />
          ) : (
            <FiSend className="text-xl" />
          )}
        </button>
      </div>
    </div>
  )
}
