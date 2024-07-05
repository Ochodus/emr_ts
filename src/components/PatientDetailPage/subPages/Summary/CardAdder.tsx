import React, { useState, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles';
import 'react-date-range-ts/dist/theme/default.css';
import 'reactjs-popup/dist/index.css';
import styles from './CardAdder.module.css';
import classNames from 'classnames/bind';
import { PopupActions } from "reactjs-popup/dist/types";
const { Menu, MenuItem, SubMenu, menuClasses } = require('react-pro-sidebar');
const { Popup }: any = require('reactjs-popup');

const CardAdder = ({ isVertical, addContainerFunction, index }: { isVertical: boolean, addContainerFunction: (type: string, path: string[], name: string, index?: number) => any, index: number }) => {

  const cx = classNames.bind(styles);
  
  const popupRef = useRef<PopupActions>(null);
  const [isFixed, setIsFixed] = useState(false)

  const addCard = (type: string, path: string[], name: string) => {
    addContainerFunction(type, path, name, index)
    popupRef.current?.close()
  }

  const setFix = () => {
    setIsFixed(!isFixed)
  }

  return (
    <div className={`${cx("hovering-wrapper")} ${isVertical ? cx("ver") : cx("row")} ${isFixed ? cx("fixed") : ""}`}>
        <div className={`${cx("card-adder")} ${isVertical ? cx("ver") : cx("row")}`}>
            
        </div>
        <div className={cx("add-icon-wrapper")}>
          
        <Popup 
            trigger={
                <div className={cx("add-icon")}>
                    +
                </div>  
            }
            ref={popupRef}
            position={`${isVertical ? "left" : "right"} center`}
            on="click"
            closeOnDocumentClick
            contentStyle={{ padding: '0px', border: 'none' }}
            onOpen={() => setFix()}
            onClose={() => setFix()}
            className={cx("selector-card-type")}
            > 

            <Menu
              menuItemStyles={{
                button: ({ level }: { level: number }) => {
                  // only apply styles on first level elements of the tree
                  if (level === 0)
                    return {
                      color: '#e2e2e2',
                      backgroundColor: "#212529",
                      '&:hover': {
                          backgroundColor: "#023162",
                      },
                      fontSize: "14px"
                    };
                }
              }}
              rootStyles={{
                ['.' + menuClasses.subMenuContent]: {
                    backgroundColor: '#343a40',
                    color: '#ffffff',
                    fontSize: "12px",
                },
                ['.' + menuClasses.button]: {
                    '&:hover': {
                        backgroundColor: "#adb5bd", 
                        color: '#343a40',
                    }
                },
                ['.' + menuClasses.subMenuRoot]: {
                }
                
            }}
            >
              <SubMenu className={cx('cardSelection')} label="신체 정보">
                <MenuItem onClick={() => addCard("Physical Exam", ['height'], "키")}> 키 </MenuItem>
                <MenuItem onClick={() => addCard("Physical Exam", ['weight'], "몸무게")}> 몸무게 </MenuItem>
                <MenuItem onClick={() => addCard("Physical Exam", ['diastolic_blood_pressure'], "최저 혈압")}> 최저 혈압 </MenuItem>
                <MenuItem onClick={() => addCard("Physical Exam", ['systolic_blood_pressure'], "최고 혈압")}> 최고 혈압 </MenuItem>
              </SubMenu>
              <SubMenu className={cx('cardSelection')} label="IMOOVE">
                <MenuItem onClick={() => addCard("IMOOVE", ['content', 'strength'], "강도")}> 강도 </MenuItem>
                <MenuItem onClick={() => addCard("IMOOVE", ['content', 'sensitivity'], "민감도")}> 민감도 </MenuItem>
                <MenuItem onClick={() => addCard("IMOOVE", ['content', 'supports', 'stability'], "Support Stability")}> Support Stability </MenuItem>
              </SubMenu>
              <SubMenu className={cx('cardSelection')} label="InBody">
                <MenuItem onClick={() => addCard("InBody", ['content', 'skeletal_muscles_fat', 'body_fat_mass'], "체지방")}> 체지방 </MenuItem>
                <MenuItem onClick={() => addCard("InBody", ['content', 'muscle_mass'], "근육량")}> 근육량 </MenuItem>
                <MenuItem onClick={() => addCard("InBody", ['content', 'lean_body_mass'], "제지방량")}> 제지방량 </MenuItem>
                <MenuItem onClick={() => addCard("InBody", ['content', 'skeletal_muscles_fat', 'skeletal_muscles_mass'], "골격근량")}> 골격근량 </MenuItem>
                <MenuItem onClick={() => addCard("InBody", ['content', 'obesity_detail', 'fat_percentage'], "체지방")}> 체지방률 </MenuItem>
              </SubMenu>
              <SubMenu className={cx('cardSelection')} label="Lookin' Body">
                <MenuItem onClick={() => addCard("Lookin' Body", ['content', 'inspections'], "Lookin' Body")}> Lookin' Body </MenuItem>
              </SubMenu>
              <SubMenu className={cx('cardSelection')} label="운동능력 검사">
                <MenuItem onClick={() => addCard("Physical Performance", ['content', 'skeletal_muscles_fat', 'body_fat_mass'], "체지방")}> 체지방 </MenuItem>
              </SubMenu>
            </Menu>
        </Popup>
        </div>
    </div>
  );
};

export default CardAdder;
