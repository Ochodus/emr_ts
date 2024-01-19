import React, { useState, useRef, MutableRefObject } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles';
import 'react-date-range-ts/dist/theme/default.css';
import 'reactjs-popup/dist/index.css';
import styles from './CardAdder.module.css';
import classNames from 'classnames/bind';
import { PopupActions } from "reactjs-popup/dist/types";
const { Popup }: any = require('reactjs-popup');

const CardAdder = ({ isVer, func, index }: { isVer: boolean, func: (type: string, index: number) => any, index: number }) => {

  const cx = classNames.bind(styles);
  
  const popupRef = useRef<PopupActions>(null);
  const [isFixed, setIsFixed] = useState(false)

  const addCard = (type: string) => {
    func(type, index)
    popupRef.current?.close()
  }

  const setFix = () => {
    setIsFixed(!isFixed)
  }

  return (
    <div className={`${cx("hovering-wrapper")} ${isVer ? cx("ver") : cx("row")} ${isFixed ? cx("fixed") : ""}`}>
        <div className={`${cx("card-adder")} ${isVer ? cx("ver") : cx("row")}`}>
            
        </div>
        <div className={cx("add-icon-wrapper")}>
          
        <Popup 
            trigger={
                <div className={cx("add-icon")}>
                    +
                </div>  
            }
            ref={popupRef}
            position={`${isVer ? "left" : "right"} center`}
            on="click"
            closeOnDocumentClick
            contentStyle={{ padding: '0px', border: 'none' }}
            onOpen={() => setFix()}
            onClose={() => setFix()}
            className={cx("selector-card-type")}
            > 
            <div className={cx("menu")}>
                <div className={cx("menu-item")} onClick={() => addCard("진료 기록")}>진료 기록</div>
                <div className={cx("menu-item")} onClick={() => addCard("SMM")}>골격근량</div>
                <div className={cx("menu-item")} onClick={() => addCard("BFM")}>체지방량</div>
                <div className={cx("menu-item")} onClick={() => addCard("Weight")}>체중</div>
            </div>
        </Popup>
        </div>
    </div>
  );
};

export default CardAdder;
