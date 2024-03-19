// PopupMessage.js
import React, { useState, useEffect } from 'react';
import './Popup.css';
import {useNavigate} from 'react-router-dom';

const PopupMessage = (props) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsVisible(false);
      navigate("/");
    }, 6000); // 10 seconds in milliseconds

    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`popup-message ${isVisible ? '' : 'hidden'}`}>
      Your Unique code is : {props.uniqueCode}
    </div>
  );
};

export default PopupMessage;