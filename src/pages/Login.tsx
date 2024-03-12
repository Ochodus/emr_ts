import { useState, useEffect, ChangeEvent } from "react";
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { changeAuth } from '../reducers/auth';
import { useLocalTokenValidation } from "../api/commons/auth";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './Login.module.css';
import classNames from 'classnames/bind';

const Login = ({axiosMode}: {axiosMode: boolean}) => {
	const checkAuth = useLocalTokenValidation() // localStorage의 로그인 정보 유효성 검사
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const cx = classNames.bind(styles)

	const [email, setEmail] = useState('') // input 필드의 이메일
	const [passw, setPassw] = useState('') // input 필드의 비밀번호

	const [isFormValid, setIsFormValid] = useState({ email: false, passw: false}) // input 필드 값의 유효성
	const [isTriedToLogin, setIsTriedToLogin] = useState(false) // 단일 세션에서 로그인 시도 여부 저장 (폼 유효성 검사 후 메시지 출력을 위한 변수)

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>, stateUpdater: Function) => {
		stateUpdater(event.target.value);
	} // Input 필드의 입력 값 갱신

	const formValidationCheck = () => {
		let emailCheck: boolean = email !== ''
		let passwCheck: boolean = passw !== ''

		setIsFormValid({
			...isFormValid, 
			email: emailCheck,
			passw: passwCheck,
		})

		return emailCheck && passwCheck
	} // Input 필드의 유효성 여부 검사

	const handleLoginClick = () => {
		setIsTriedToLogin(true);

		if (!formValidationCheck())  {
			alert("이메일 및 비밀번호 형식이 맞지 않습니다.")
			return
		}

		post_api_login();
	} // 로그인 버튼 클릭 시 로그인 시도

	const handleKeyPress = (e: any) => {
		if (e.key === "Enter") {
			console.log(document.getElementById("btn-login"))
			document.getElementById(cx('btn-login'))?.click()
		}
	}

	const post_api_login = async () => {
		try {
			const response = await axios.post(
				'/api/auth/login',
				{ email: email, password: passw }
			);
			const token = response.data; // 응답에서 액세스 토큰 가져오기
			// 액세스 토큰을 상태로 저장
			console.log(token)
			alert("로그인 성공!");
			dispatch(changeAuth({email: email, token: token.access_token}))

			navigate("/")
		} catch (error) {
			console.error("로그인 중 오류 발생:", error);
		}
	} // 백엔드 로그인 api 호출

	useEffect(() => {
		if (axiosMode) checkAuth("/")
	}, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 정보 유효성 검사 수행

	return (
		<div className={cx('structure-login')}>
			<img id={cx('logo-login-page')} src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="doctor" />
			<h1 id={cx('title-login')} >환자 데이터베이스 관리 시스템</h1>
			<div id={cx('field-login')}>
				<div id={cx('text-detail-login')}>
					<h3>로그인</h3>
					<p>병원 관계자만 로그인이 가능합니다.</p>
				</div>
				<Form id={cx('input-group-login')}>
					<Form.Control id={cx('input-email')}
						type="text"
						placeholder="Email"
						aria-label="id"
						value={email}
						onChange={(event: ChangeEvent<HTMLInputElement>) => handleInputChange(event, setEmail)}
						onKeyDown={(e) => handleKeyPress(e)}
						size="lg"
					/>
					{isFormValid.email || !isTriedToLogin ? null : <div className={cx("form-unvalid-msg")}>* 필수 입력란입니다.</div>}
					<Form.Control id={cx('input-password')}
						type="password"
						placeholder="Password"
						aria-label="password"
						value={passw}
						onChange={(event: ChangeEvent<HTMLInputElement>) => handleInputChange(event, setPassw)}
						onKeyDown={(e) => handleKeyPress(e)}
						size="lg"
					/>
					{isFormValid.passw || !isTriedToLogin ? null : <div className={cx("form-unvalid-msg")}>* 필수 입력란입니다.</div>}
					<Button variant="info" id={cx('btn-login')} size="lg" onClick={handleLoginClick}>
					Login
					</Button>
					<div className={cx('signup-link')}>
					<a href="/onnuri/signup">회원 가입</a>
					</div>
				</Form>
			</div>
		</div>
	);
};

export default Login;
