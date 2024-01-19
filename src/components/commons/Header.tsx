import React from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import NavDropdown from 'react-bootstrap/NavDropdown';
import styles from './Header.module.css'
import classNames from 'classnames/bind';

const HeaderMain = ({isLogin}: {isLogin?: boolean}) => {
    const navigate = useNavigate()
    const cx = classNames.bind(styles)

    const auth = JSON.parse(window.localStorage.getItem("persist:auth") ?? "[]")
    const userEmail: string = isLogin ? JSON.parse(auth.email ?? "[]") : "로그인" // localStorage에 저장된 유저의 이메일

    const handleLogoutClick = () => {
        window.localStorage.removeItem("persist:auth")
        navigate("/login")
    } // 로그아웃 버튼 클릭 이벤트

    return (
        <div className={cx("header-main")}>
            <div className={cx("inline-section")}>
                <div className={`${cx("col-group")} ${cx("col-group-left")}`} style={{ width: "283px" }}>
                    <div className={cx("logo-content")}>
                        <img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="" style={{ maxHeight: "100%" }} onClick={() => navigate("/")}></img>
                    </div>
                </div>
                <div className={`${cx("col-group")} ${cx("col-group-center")}`}>
                </div>
                <div className={`${cx("col-group")} ${cx("col-group-right")}`} style={{ width: "283px" }}>
                    <div className={`${cx("inline-col")}`}>
                        <NavDropdown
                            title={<div>{userEmail}<img alt=''/></div>}
                            menuVariant="bright"
                            id={cx("header-dropdown")}
                        >
                            <NavDropdown.Item>설정</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => navigate('/user-info')}>내 정보</NavDropdown.Item>
                            <NavDropdown.Divider></NavDropdown.Divider>
                            <NavDropdown.Item onClick={handleLogoutClick}>로그아웃</NavDropdown.Item>
                        </NavDropdown>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeaderMain;

