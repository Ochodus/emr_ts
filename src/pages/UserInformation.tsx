import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocalTokenValidation } from '../api/commons/auth';
import { User } from "../interfaces";
import { useNavigate } from "react-router-dom";
import { Button, Box, Card, CardActions, CardOverflow, Chip, Divider, FormControl, FormHelperText, FormLabel, IconButton, Input, Select, Sheet, Stack, Typography, Option, AspectRatio, Avatar } from "@mui/joy";
import { updateDeepValue, validationCheck } from "../api/commons/utils";
import { Delete, EditRounded, EmailRounded, InfoOutlined, Password, Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { BASE_BACKEND_URL, BASE_FILE_URL } from "api/commons/request";

export const initialUser: User = {
	email: "",
	first_name: "",
	last_name: "",
	position: "기타",
	sex: 0,
	phone_number: "010--",
	department: "기타",
	profile_url: ""
}

const UserInformation = ({axiosMode}: {axiosMode: boolean}) => {
	const checkAuth = useLocalTokenValidation()
	const navigate = useNavigate()

	const auth = window.localStorage.getItem("persist:auth")
    const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

    const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			}
		}
    }, [accessToken]);

	const [currentUser, setCurrentUser] = useState(initialUser)

	const [newProfileUrl, setNewProfileUrl] = useState("")
	const [oldPassw, setOldPassw] = useState("")
	const [passw, setPassw] = useState("")
	const [passwC, setPasswC] = useState("")
	const [showPswd, setShowPswd] = useState<boolean>(false)

	const [submitted, setSubmitted] = useState(false) // 회원 가입 시도 여부

  	const [newProfile, setNewProfile] = useState<File | null>(null)
	const [fileValue, setFileValue] = useState("")
	
	const formValidationCheck = () => {
		const { phone_number, ...others } = currentUser
		return validationCheck(others) && validationCheck(phone_number, false, (value: string) => /^010-\d{4}-\d{4}$/.test(value))
	} // 회원 가입 폼 유효성 검사

	const updateUserInformation = async () => {
		try {
			let data = {...currentUser}
			if (newProfile) {
				let formData = new FormData()
				formData.append('file', newProfile)
				const response = await axios.post(`${BASE_BACKEND_URL}/api/file`, formData, config)
				data = {...data, profile_url: response.data.file_path}
			}

			await axios.patch(`${BASE_BACKEND_URL}/api/users`, data, config)
		} catch (error) {
			console.error("사용자 정보 갱신 중 오류 발생:", error)
		}
	}

	const updatePassword = async () => {
		try {
			await axios.post(`${BASE_BACKEND_URL}/api/users/password/change`, {old_password: oldPassw, new_password: passw}, config)
			return true
		} catch (error) {
			console.error("비밀번호 변경 중 오류 발생:", error)
			return false
		}
	}

	const getCurrentUser = useCallback(async () => {
		try {
			const response = await axios.get(`${BASE_BACKEND_URL}/api/users/me`, config)
			return response.data
		} catch (error) {
			console.error("사용자 조회 중 오류 발생:", error)
		}
	}, [config])

	const handleUpdate = async () => {
		setSubmitted(true)
		if (!formValidationCheck()) {
			alert("유효하지 않은 입력 필드가 있습니다.")
			return
		}
		else if (oldPassw === "" && passw !== "") {
			alert("비밀번호를 변경하려면 기존 비밀번호를 입력해주세요.")
			return
		}
		else if (passw !== passwC && passw !== "") {
			alert("비밀번호가 일치하지 않습니다.")
			return
		}
		else {
			updateUserInformation()
			if (passw === passwC && oldPassw !== "") {
				let response = await updatePassword()
				if (!response) {
					alert("기존 비밀번호가 일치하지 않습니다.")
					return
				}
			}
			navigate('/');
		}
	}

	useEffect(() => {
		if (newProfile) {
		  const reader = new FileReader();
	
		  reader.onload = (e) => {
			setNewProfileUrl(e.target?.result as string)
		  }
	
		  reader.readAsDataURL(newProfile)
		}
	  }, [newProfile])

	useEffect(() => {
		checkAuth(".")
		
		getCurrentUser().then((result) => {
			setCurrentUser(result as User)
		})
	}, [checkAuth, getCurrentUser]) // 페이지 첫 렌더링 시 localStorage의 로그인 정보 유효성 검사 수행

	return (
		<Sheet sx={{ height: '100vh' }}>
			<Box
				component="header"
				sx={{
					py: 3,
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<Box sx={{ gap: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					<IconButton size="sm" onClick={() => navigate('/')}>
						<img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt=""/>
					</IconButton>
				</Box>
			</Box>
			<Box sx={{ flex: 1, width: '100%' }}>
				<Stack
				spacing={4}
				sx={{
					display: 'flex',
					mx: 'auto',
					maxWidth: '85vw',
					px: { xs: 2, md: 6 },
					py: { xs: 2, md: 3 },
				}}
				>
					<Card>
						<Box sx={{ mb: 1 }}>
							<Typography level="h4" sx={{ mb: 1 }}>사용자 정보 수정</Typography>
						</Box>
						<Divider />
						<Stack
							direction={{ xs: "column", md: "row" }}
							spacing={3}
							sx={{ display: 'flex', my: 1 }}
						>
							<Stack direction={{ xs: "row", md: "column" }} sx={{ justifyContent: { xs: 'center' } }} spacing={1}>
								<Box sx={{position: 'relative'}}>
									<AspectRatio
										ratio="1"
										sx={{ flex: 0, maxHeight: 200, minWidth: 120, maxWidth: 200, borderRadius: '100%' }}
									>
										<Avatar
											variant="outlined"
											size="sm"
											src={`${BASE_FILE_URL}${newProfileUrl !=="" ? newProfileUrl : currentUser.profile_url !== "" ? currentUser.profile_url : undefined}`}
											onClick={() => navigate('/user-info')}
										/>                  
									</AspectRatio>                
									<IconButton
										aria-label="upload new picture"
										size="sm"
										variant="outlined"
										color="neutral"
										sx={{
											bgcolor: 'background.body',
											position: 'absolute',
											zIndex: 3,
											borderRadius: '50%',
											left: newProfileUrl !== "" ? 2 : 84,
											top: 84,
											boxShadow: 'sm',
											transition: 'left 0.3s ease'
										}}
									>
										<EditRounded onClick={() => {document.getElementById('profile_input')?.click()}}/>
									</IconButton>
									<IconButton
										aria-label="upload new picture"
										size="sm"
										variant="outlined"
										color="neutral"
										sx={{
											bgcolor: 'background.body',
											position: 'absolute',
											zIndex: 2,
											borderRadius: '50%',
											left: 84,
											top: 84,
											boxShadow: 'sm',
											visibility: newProfileUrl !== "" ? "visible" : "hidden",
											transition: newProfileUrl !== "" ? 'none' : "visibility 0s linear 0.3s"
										}}
									>
										<Delete onClick={() => {setNewProfileUrl(""); setNewProfile(null); setFileValue("")}}/>
									</IconButton>
								</Box>
								<input 
									id='profile_input' 
									type='file'
									value={fileValue}
									style={{ display: 'none' }}
									onChange={(e) => {setNewProfile(e.target.files?.item(0) ?? null); setFileValue(e.target.value)}}
								/>
							</Stack>
							<Divider sx={{ display: { xs: 'block', md: 'none' } }}/>
							<Stack spacing={2} sx={{ flex: '1 1 auto', overflow: 'hidden' }}>
								<Stack spacing={1} direction={{ xs: 'column', md: 'row' }}>                  
									<FormControl sx={{ flexGrow: 1 }} error={!validationCheck(currentUser.last_name) && submitted}>
										<FormLabel>이름</FormLabel>
										<Input 
											size="sm" 
											placeholder="성"
											value={currentUser.last_name}
											onChange={(e) => updateDeepValue(setCurrentUser, ['last_name'], e.target.value)}
											sx={{
												backgroundColor: '#ffffff'
											}}
										/>
										{!validationCheck(currentUser.last_name) && submitted && 
											<FormHelperText>
												<InfoOutlined />
												필수 입력란입니다.
											</FormHelperText>
										}     
									</FormControl>
									<FormControl sx={{ flexGrow: 1 }} error={!validationCheck(currentUser.first_name) && submitted}>
										<FormLabel sx={{ display: { xs: 'none', md: 'block'} }}><br></br></FormLabel>
										<Input 
											size="sm" 
											placeholder="이름" 
											value={currentUser.first_name}
											onChange={(e) => updateDeepValue(setCurrentUser, ['first_name'], e.target.value)}
											sx={{
												backgroundColor: '#ffffff'
											}}
										/>
										{!validationCheck(currentUser.first_name) && submitted && 
											<FormHelperText>
												<InfoOutlined />
												필수 입력란입니다.
											</FormHelperText>                            
										}   
									</FormControl>
								</Stack>
								<Divider/>
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
									<FormControl sx={{ flexGrow: 1 }}>
										<FormLabel>직위</FormLabel>
										<Select
											size="md"
											placeholder="직위 선택"
											value={currentUser.position}
											renderValue={(selected) => (
												<Chip variant="soft" color="primary">
													{selected?.label}
												</Chip>
											)}
											slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
											onChange={(_, value) => updateDeepValue(setCurrentUser, ['position'], value)}
											sx={{
												backgroundColor: '#ffffff'
											}}
										>
											{['원장', '국장', '간호조무사', '물리치료사', '기타'].map((position, index) => {
												return (
													<Option key={index} value={position}>{`${position}`}</Option>
												)
											})}
										</Select>
									</FormControl>
									<FormControl sx={{ flexGrow: 1 }}>
										<FormLabel>부서</FormLabel>
										<Select
											size="md"
											placeholder="부서 선택"
											value={currentUser.department}
											renderValue={(selected) => (
												<Chip variant="soft" color="primary">
													{selected?.label}
												</Chip>
											)}
											slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
											onChange={(_, value) => updateDeepValue(setCurrentUser, ['department'], value)}
											sx={{
												backgroundColor: '#ffffff'
											}}
										>
											{['통증', '센터', '기타'].map((department, index) => {
												return (
													<Option key={index} value={department}>{`${department}`}</Option>
												)
											})}
										</Select>
									</FormControl>                  
								</Stack>
								<Divider/>
								<Stack direction={{ xs: "column", md: "row" }} spacing={2}>
									<Stack direction={{ xs: "column", md: "row" }} sx={{ width: { xs: '100%', md: '70%' } }} spacing={1}>
										<FormControl sx={{ flex: '1 1 0', width: { xs: '100%', md: '30%' } }}>
											<FormLabel>전화번호</FormLabel>
											<Input
												size="sm"
												type="number"
												value={'010'}
												placeholder=""
												disabled={true}
												sx={{
													backgroundColor: '#ffffff'

												}}
											/>
										</FormControl>
										<FormControl sx={{ flex: '1 1 0', width: { xs: '100%', md: '30%' } }} error={!validationCheck(currentUser.phone_number.split('-')[1]) && submitted}>
											<FormLabel sx={{ display: { xs: 'none', md: 'block' }}}><br/></FormLabel>
											<Input
												size="sm"
												type="number"
												value={currentUser.phone_number.split('-')[1]}
												onChange={(e) => updateDeepValue(setCurrentUser, ['phone_number'], `${currentUser.phone_number.split('-')[0]}-${e.target.value}-${currentUser.phone_number.split('-')[2]}`)}
												placeholder=""
												sx={{
												backgroundColor: '#ffffff'
												}}
											/>
											{!validationCheck(currentUser.phone_number.split('-')[1]) && submitted && 
												<FormHelperText>
												<InfoOutlined />
												필수 입력란입니다.
												</FormHelperText>                            
											} 
										</FormControl>
										<FormControl sx={{ flex: '1 1 0', width: { xs: '100%', md: '30%' } }} error={!validationCheck(currentUser.phone_number.split('-')[2]) && submitted}>
											<FormLabel sx={{ display: { xs: 'none', md: 'block' } }}><br/></FormLabel>
											<Input
												size="sm"
												type="number"
												value={currentUser.phone_number.split('-')[2]}
												onChange={(e) => updateDeepValue(setCurrentUser, ['phone_number'], `${currentUser.phone_number.split('-')[0]}-${currentUser.phone_number.split('-')[1]}-${e.target.value}`)}
												placeholder=""
												sx={{
												backgroundColor: '#ffffff'
												}}
											/>
											{!validationCheck(currentUser.phone_number.split('-')[2]) && submitted && 
												<FormHelperText>
												<InfoOutlined />
												필수 입력란입니다.
												</FormHelperText>                            
											}
										</FormControl>                    
									</Stack>
									<FormControl sx={{ flexGrow: 1, width: { xs: '100%', md: '25%' } }} error={!validationCheck(currentUser.email) && submitted}>
										<FormLabel>이메일</FormLabel>
										<Input
											size="sm"
											type="email"
											value={currentUser.email}
											onChange={(e) => updateDeepValue(setCurrentUser, ['email'], e.target.value)}
											startDecorator={<EmailRounded />}
											placeholder="example@example.com"
											sx={{ backgroundColor: '#ffffff' }}                      
										/>
										{!validationCheck(currentUser.email) && submitted && 
											<FormHelperText>
												<InfoOutlined />
												필수 입력란입니다.
											</FormHelperText>                            
										}
									</FormControl>                  
								</Stack>
								<Divider/>
								<Stack direction={{ xs: "column", md: "row" }} spacing={2}>
									<FormControl sx={{ flexGrow: 1, width: { xs: '100%', md: '30%' } }}>
										<FormLabel>기존 비밀번호</FormLabel>
										<Input
											size="sm"
											type={showPswd ? "text" : "password"}
											startDecorator={<Password />}
											endDecorator={<IconButton onClick={() => {setShowPswd(!showPswd)}}>{showPswd ? <Visibility/> : <VisibilityOff/>}</IconButton>}
											placeholder="Old password"
											value={oldPassw}
											onChange={(e) => {setOldPassw(e.target.value)}}
											sx={{ backgroundColor: '#ffffff' }}
										/>
									</FormControl>
									<FormControl sx={{ flexGrow: 1, width: { xs: '100%', md: '30%' } }}>
										<FormLabel>새 비밀번호</FormLabel>
										<Input
											size="sm"
											type={showPswd ? "text" : "password"}
											startDecorator={<Password />}
											endDecorator={<IconButton onClick={() => {setShowPswd(!showPswd)}}>{showPswd ? <Visibility/> : <VisibilityOff/>}</IconButton>}
											placeholder="New password"
											value={passw}
											onChange={(e) => {setPassw(e.target.value)}}
											sx={{ backgroundColor: '#ffffff' }}
										/>
									</FormControl>
									<FormControl sx={{ flexGrow: 1, width: { xs: '100%', md: '30%' } }} error={passwC !== passw && passw !== ""}>
										<FormLabel>새 비밀번호 확인</FormLabel>
										<Input
											size="sm"
											type={showPswd ? "text" : "password"}
											startDecorator={<Password />}
											endDecorator={<IconButton onClick={() => {setShowPswd(!showPswd)}}>{showPswd ? <Visibility/> : <VisibilityOff/>}</IconButton>}
											placeholder="Password confirm"
											value={passwC}
											onChange={(e) => {setPasswC(e.target.value)}}
											sx={{ backgroundColor: '#ffffff' }}
										/>
										{passwC !== passw && passw !== "" &&
											<FormHelperText>
												<InfoOutlined />
												비밀번호가 일치하지 않습니다.
											</FormHelperText>                       
										}
									</FormControl>
								</Stack>
							</Stack>
						</Stack>
						<CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
							<CardActions sx={{ alignSelf: 'flex-end', pt: 2 }}>
								<Button size="sm" variant="outlined" color="neutral" onClick={() => navigate('/')}>
									취소
								</Button>
								<Button size="sm" variant="solid" onClick={handleUpdate}>
									변경
								</Button>
							</CardActions>
						</CardOverflow>
					</Card>
				</Stack>
			</Box>
		</Sheet>
	);
};

export default UserInformation;