import {
  faCheck,
  faCircleNotch,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Fragment, useEffect, useRef, useState } from 'react';

export default function CheckRemove({ children }) {
  const [check, setCheck] = useState(faCheck);
  return (
    <div
      className="is-flex has-background-white is-clickable"
      onMouseEnter={() => {
        setCheck(faXmark);
      }}
      onMouseLeave={() => {
        setCheck(faCheck);
      }}
    >
      <span className="icon my-auto has-text-grey mx-2">
        <FontAwesomeIcon icon={check} />
      </span>
      {children}
    </div>
  );
}
