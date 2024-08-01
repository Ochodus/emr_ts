import { useState, useEffect, ChangeEvent } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { changeAuth } from '../reducers/auth';
import { useLocalTokenValidation } from "api/commons/auth";
import axios from "axios";
import { Box, CssBaseline, CssVarsProvider, GlobalStyles, IconButton, Stack, Typography, Link, Button, FormControl, FormLabel, Input, Checkbox } from "@mui/joy";
import { BASE_BACKEND_URL } from "api/commons/request";

const Login = ({axiosMode}: {axiosMode: boolean}) => {
	const checkAuth = useLocalTokenValidation() // localStorage의 로그인 정보 유효성 검사
	const dispatch = useDispatch();

	const value = useSelector((state: any) => state.loginInfo)

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

	const handleLoginClick = async () => {
		setIsTriedToLogin(true);

		if (!formValidationCheck())  {
			alert("이메일 및 비밀번호 형식이 맞지 않습니다.")
			return
		}

		post_api_login()
	} // 로그인 버튼 클릭 시 로그인 시도

	const handleKeyPress = (e: any) => {
		if (e.key === "Enter") {
			document.getElementById('btn-login')?.click()
		}
	}

	const post_api_login = async () => {
		try {
			const response = await axios.post(
				`${BASE_BACKEND_URL}/api/auth/login`,
				{ email: email, password: passw }
			);
			const token = response.data; // 응답에서 액세스 토큰 가져오기
			// 액세스 토큰을 상태로 저장
			dispatch(changeAuth({email: email, token: token.access_token}))
			alert("로그인 성공!");
		} catch (error) {
			console.error("로그인 중 오류 발생:", error);
		}
	} // 백엔드 로그인 api 호출

	useEffect(() => {
		if (axiosMode) checkAuth("/")
	}, [checkAuth, axiosMode]) // 페이지 첫 렌더링 시 localStorage의 로그인 정보 유효성 검사 수행

	useEffect(() => {
		checkAuth("/", value.token)
	}, [value, checkAuth])

	return (
	<CssVarsProvider defaultMode="dark" disableTransitionOnChange>
		<CssBaseline />
		<GlobalStyles
			styles={{
			':root': {
				'--Form-maxWidth': '800px',
				'--Transition-duration': '0.4s', // set to `none` to disable transition
			},
			}}
		/>
		<Box
			sx={(theme) => ({
			width: { xs: '100%', md: '50vw' },
			transition: 'width var(--Transition-duration)',
			transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
			position: 'relative',
			zIndex: 1,
			display: 'flex',
			justifyContent: 'flex-end',
			backdropFilter: 'blur(12px)',
			backgroundColor: 'rgba(255 255 255 / 0.2)',
			[theme.getColorSchemeSelector('dark')]: {
				backgroundColor: 'rgba(19 19 24 / 0.4)',
			},
			})}
		>
			<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				minHeight: '100dvh',
				width: '100%',
				px: 4,
			}}
			>
			<Box
				component="header"
				sx={{
					py: 3,
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<Box sx={{ gap: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				<IconButton size="sm">
					<img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt='' />
				</IconButton>
				<Typography level="h2">환자 데이터베이스 관리 시스템</Typography>
				</Box>
			</Box>
			<Box
				component="main"
				sx={{
				my: 'auto',
				py: 2,
				pb: 5,
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
				width: 400,
				maxWidth: '100%',
				mx: 'auto',
				borderRadius: 'sm',
				'& form': {
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
				},
				[`& .MuiFormLabel-asterisk`]: {
					visibility: 'hidden',
				},
				}}
			>
				<Stack gap={4} sx={{ mb: 2 }}>
				<Stack gap={1}>					
					<Typography component="h1" level="h3">
					로그인
					</Typography>
					<Typography level="body-sm">
					병원 관계자만 로그인이 가능합니다.{' '}
					<Link href="/onnuri/signup" level="title-sm">
						회원 가입
					</Link>
					</Typography>
				</Stack>
				</Stack>
				<Stack gap={4} sx={{ mt: 2 }}>
					<FormControl error={isTriedToLogin && email === ""} required>
					<FormLabel>이메일</FormLabel>
					<Input 
						type="email" 
						name="email" 
						value={email}
						onChange={(event: ChangeEvent<HTMLInputElement>) => handleInputChange(event, setEmail)}
						onKeyDown={(e) => handleKeyPress(e)}
					/>
					</FormControl>
					<FormControl error={isTriedToLogin && passw === ""}  required>
					<FormLabel>비밀번호</FormLabel>
					<Input 
						type="password" 
						name="password" 
						value={passw}
						onChange={(event: ChangeEvent<HTMLInputElement>) => handleInputChange(event, setPassw)}
						onKeyDown={(e) => handleKeyPress(e)}
					/>
					</FormControl>
					<Stack gap={4} sx={{ mt: 2 }}>
					<Box
						sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						}}
					>
						<Checkbox size="sm" label="자동 로그인" name="persistent" />
						<Link level="title-sm" href="#replace-with-a-link">
						비밀번호 찾기
						</Link>
					</Box>
					<Button id={'btn-login'} fullWidth onClick={handleLoginClick}>
						로그인
					</Button>
					</Stack>
				</Stack>
			</Box>
			<Box component="footer" sx={{ py: 3 }}>
				<Typography level="body-xs" textAlign="center">
				© 온누리 {new Date().getFullYear()}
				</Typography>
			</Box>
			</Box>
		</Box>
		<Box
			sx={(theme) => ({
			height: '100%',
			position: 'fixed',
			right: 0,
			top: 0,
			bottom: 0,
			left: { xs: 0, md: '50vw' },
			transition:
				'background-image var(--Transition-duration), left var(--Transition-duration) !important',
			transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
			backgroundColor: 'background.level1',
			backgroundSize: 'cover',
			backgroundPosition: 'left',
			backgroundRepeat: 'no-repeat',
			backgroundImage:
				`url(${process.env.PUBLIC_URL}/images/space12.jpg)`,
			[theme.getColorSchemeSelector('dark')]: {
				backgroundImage:
				`url(${process.env.PUBLIC_URL}/images/space12.jpg)`,
			},
			})}
		/>
		</CssVarsProvider>
	);
};

export default Login;
