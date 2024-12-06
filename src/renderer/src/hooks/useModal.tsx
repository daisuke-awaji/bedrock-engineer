/* eslint-disable react/prop-types */
import { Modal, ModalSizes } from 'flowbite-react'
import { useState } from 'react'

type CustomModalProps = {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  size?: keyof ModalSizes
}

const useModal = () => {
  const [show, setShow] = useState(false)

  const openModal = () => {
    setShow(true)
  }

  const closeModal = () => {
    setShow(false)
  }

  const CustomModal: React.FC<CustomModalProps> = ({ children, header, footer, size }) => (
    <>
      <Modal dismissible show={show} onClose={() => setShow(false)} size={size}>
        {header && <Modal.Header>{header}</Modal.Header>}
        <Modal.Body>{children}</Modal.Body>
        {footer && <Modal.Footer>{footer}</Modal.Footer>}
      </Modal>
    </>
  )

  return {
    Modal: CustomModal,
    openModal,
    closeModal
  }
}

export default useModal
