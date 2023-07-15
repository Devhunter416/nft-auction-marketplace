import { useState } from 'react'

type Props = {
    children: React.ReactNode;
    open: boolean;
  };

function Modal({ children, open }: Props) {
  
  const className ="modal modal-bottom sm:modal-middle "+ (open? "modal-open":"")

  return (
    <div className={className}>
      <div className="modal-box">{children}</div>
    </div>
  )
}



export default Modal;