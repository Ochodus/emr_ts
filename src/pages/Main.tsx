import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/commons"
import { useLocalTokenValidation } from "../api/commons/auth";
import { ReactComponent as Humancon } from '../assets/human.svg'
import { ReactComponent as Histcon } from '../assets/histogram.svg'
import styles from './Main.module.css';
import classNames from 'classnames/bind';


const Main = ({axiosMode}: {axiosMode: boolean}) => {
  const navigate = useNavigate();
  const cx = classNames.bind(styles);
  const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수

  const [isLogin, setIsLogin] = useState(false) // 현재 로그인 여부 저장

  function handleSectionClick(section: string) {
    navigate("/manage/" + section);
  } // 시스템 선택 이벤트 처리

  useEffect(() => {
    let testMode = true
    if ((process.env.NODE_ENV !== 'development' || testMode) && axiosMode) checkAuth().then((resolvedData) => {
      setIsLogin(resolvedData)
    })
  }, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

  return (
    <div className={cx("structure")}>
      <Header isLogin={isLogin}></Header>
      <div className={cx("section_wrap")}>
        <main>
          <div className={cx("inside")}>
            <div className={`${cx("doz_row")} ${cx("texts")}`}>
              <div className={cx("text-table")}>
                <div>
                  <p style={{ textAlign: "center", margin: "0" }}>
                    <span style={{ fontSize: "36px", color: "rgb(26, 26, 61)" }}>
                      <strong>Features</strong>
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className={`${cx("doz_row")} ${cx("texts")}`}>
              <div className={cx("padding")}>
                <div style={{ height: "50px" }}>
                </div>
              </div>
            </div>
            <div className={cx("container-selections")}>
              <div className={cx("selection")} onClick={() => handleSectionClick("patients-table")}>
                <div className={cx("circlepic")}>
                  <div className={cx("circleborder")}>
                  <Humancon fill="#343434"></Humancon>
                  </div>
                </div>
                <p className={cx("sectionHead")}>환자 관리 시스템</p>
              </div>
              <div className={cx("selection")} onClick={() => handleSectionClick("status")}>
                <div className={cx("circlepic")}>
                  <div className={cx("circleborder")}>
                    <Histcon fill="#343434"></Histcon>
                  </div>
                </div>
                <p className={cx("sectionHead")}>데이터 통계 시스템</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Main;
