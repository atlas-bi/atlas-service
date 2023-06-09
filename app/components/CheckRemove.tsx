// import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

export default function CheckRemove({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}) {
  const [check, setCheck] = useState(faCheck);
  return (
    <div
      className="is-flex has-background-white is-clickable"
      onMouseEnter={() => {
        // setCheck(faXmark);
      }}
      onMouseLeave={() => {
        // setCheck(faCheck);
      }}
      onClick={onClick}
    >
      <span className="icon my-auto has-text-grey mx-2">
        {/*<FontAwesomeIcon icon={check} />*/}
      </span>
      {children}
    </div>
  );
}
