import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardActions, CardOverflow, Divider, FormControl, FormLabel, IconButton, Input, Select, Stack, Typography, Option, Button, Chip, Sheet, FormHelperText } from "@mui/joy";
import { EmailRounded, InfoOutlined, Password, Visibility, VisibilityOff } from "@mui/icons-material";
import { preventAllNonDigit, validationCheck } from "api/commons/utils";
import { BASE_BACKEND_URL } from "api/commons/request";

const SignUp = () => {
	const navigate = useNavigate()

	const [firstName, setFirstName] = useState("")
	const [lastName, setLastName] = useState("")
	const [email, setEmail] = useState("")
	const [phoneN, setPhoneN] = useState(["", ""])
	const [passw, setPassw] = useState("")
	const [passwC, setPasswC] = useState("")
	const [showPswd, setShowPswd] = useState<boolean>(false)
	const [selectedPosition, setSelectedPosition] = useState("원장")
	const [selectedDepartment, setSelectedDepartment] = useState("통증")

  const [toggleInuseEmail, setToggleInuseEmail] = useState(false)

	const [submitted, setSubmitted] = useState(false) // 회원 가입 시도 여부

  const handleRegistrationClick = () => {
    setSubmitted(true)
    setToggleInuseEmail(false)

    if (!formValidationCheck()) {
      return
    }

    post_signup()
  } // 회원 가입 버튼 클릭 시 이벤트

	const formValidationCheck = () => {

		let nameCheck = firstName !== "" && lastName !== ""
		let phoneNCheck = phoneN[0] !== "" && phoneN[1] !== ""
		let emailCheck = email !== ""
		let passwCheck = passw !== ""
		let passwCCheck = passw === passwC

		return nameCheck && phoneNCheck && emailCheck && passwCheck && passwCCheck && validationCheck(email, false, (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    }) && validationCheck(phoneN[0], false, (value: string) => { return /^\d{4}$/.test(value) })
    && validationCheck(phoneN[1], false, (value: string) => { return /^\d{4}$/.test(value) })
	} // 회원 가입 폼 유효성 검사

  const post_signup = async () => {
		try {
      const response = await axios.post(
        `${BASE_BACKEND_URL}/api/auth/signup`,
        {
          email: email,
          password: passw,
          first_name: firstName,
          last_name: lastName,
          position: selectedPosition,
          sex: 0,
          phone_number: `010-${phoneN[0]}-${phoneN[1]}`,
          department: selectedDepartment,
          profile_url: ""
        }
		  )

		const token = response.data

		console.log("성공 - 액세스 토큰:", token)
		navigate('/login');
		} catch (error) {
      if ((error as AxiosError<{code: string}, any>).response?.data.code === "ALREADY_EXISTENT_OBJECT") {setToggleInuseEmail(true); alert('이미 가입된 이메일입니다.')}
      else {console.error("회원 가입 중 오류 발생:", error); alert('회원가입 실패. 잠시 후 다시 시도해 주세요.')}      
		}
	} // 회원 가입 벡앤드 요청

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
				<IconButton size="sm" onClick={() => navigate('/login')}>
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
              <Typography level="h4" sx={{ mb: 1 }}>사용자 등록</Typography>
              <Typography level="body-sm">
                병원 관계자만 회원 가입이 가능합니다.
              </Typography>
            </Box>
            <Divider />
            <Stack
              direction="row"
              spacing={3}
              sx={{ display: { xs: 'flex', md: 'flex', lg: 'flex' }, my: 1 }}
            >
              <Stack spacing={2} sx={{ flexGrow: 1 }}>
                <FormControl error={(!validationCheck(lastName) || !validationCheck(firstName)) && submitted}>
                  <FormLabel>이름</FormLabel>
                  <Stack spacing={1} direction={{ xs: 'column', lg: 'row'}}>                  
                    <FormControl sx={{ flexGrow: 1 }} error={!validationCheck(lastName) && submitted}>                      
                      <Input 
                        size="sm" 
                        placeholder="성"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        sx={{
                          backgroundColor: '#ffffff'
                        }}
                      />   
                    </FormControl>                  
                    <FormControl sx={{ flexGrow: 1 }} error={!validationCheck(firstName) && submitted}>
                      <Input 
                        size="sm" 
                        placeholder="이름" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        sx={{
                          backgroundColor: '#ffffff'
                        }}
                      />
                    </FormControl>
                  </Stack>
                  {(!validationCheck(lastName) || !validationCheck(firstName)) && submitted && 
                    <FormHelperText>
                      <InfoOutlined />
                      이름을 입력해 주세요.
                    </FormHelperText>                            
                  }  
                </FormControl>
                <Divider/>
                <Stack direction={{ xs: 'column', lg: 'row'}} spacing={2}>
                  <FormControl sx={{ flexGrow: 1 }}>
                    <FormLabel>직위</FormLabel>
                    <Select
                      size="md"
                      placeholder="직위 선택"
                      value={selectedPosition}
                      renderValue={(selected) => (
                          <Chip variant="soft" color="primary">
                              {selected?.label}
                          </Chip>
                      )}
                      slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                      onChange={(_, value) => setSelectedPosition(value ?? "")}
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
                      value={selectedDepartment}
                      renderValue={(selected) => (
                          <Chip variant="soft" color="primary">
                              {selected?.label}
                          </Chip>
                      )}
                      slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                      onChange={(_, value) => setSelectedDepartment(value ?? "")}
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
                <Stack direction={{ xs: 'column', lg: 'row'}} spacing={2}>
                  <FormControl error={(!validationCheck(phoneN[0], false, (value: string) => { return /^\d{4}$/.test(value) }) || 
                    !validationCheck(phoneN[1], false, (value: string) => { return /^\d{4}$/.test(value) })) && submitted}>
                    <FormLabel>전화번호</FormLabel>
                    <Stack  direction={{ xs: 'column', md:'row', lg: 'row'}} spacing={1}>
                      <FormControl sx={{ flexGrow: 1 }}>                        
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
                      <FormControl error={!validationCheck(phoneN[0], false, (value: string) => { return /^\d{4}$/.test(value) }) && submitted} sx={{ flexGrow: 1 }}>
                        <Input
                          size="sm"
                          type="number"
                          value={phoneN[0]}
                          onChange={(e) => {
                            let value = e.target.value
                            if (value.length > 4) {value = value.slice(0, 4)}
                            setPhoneN([value, phoneN[1]])
                          }}
                          onKeyDown={preventAllNonDigit}
                          placeholder=""
                          sx={{
                            backgroundColor: '#ffffff'
                          }}
                        />
                      </FormControl>
                      <FormControl error={!validationCheck(phoneN[1], false, (value: string) => { return /^\d{4}$/.test(value) }) && submitted} sx={{ flexGrow: 1 }}>
                        <Input
                          size="sm"
                          type="number"
                          value={phoneN[1]}
                          onChange={(e) => {
                            let value = e.target.value
                            if (value.length > 4) {value = value.slice(0, 4)}
                            setPhoneN([phoneN[0], value])                          
                          }}
                          onKeyDown={preventAllNonDigit}
                          placeholder=""
                          sx={{
                            backgroundColor: '#ffffff'
                          }}
                        />
                      </FormControl>
                    </Stack>
                    {(!validationCheck(phoneN[0], false, (value: string) => { return /^\d{4}$/.test(value) }) || 
                    !validationCheck(phoneN[1], false, (value: string) => { return /^\d{4}$/.test(value) })) && 
                    submitted && 
                      <FormHelperText>
                        <InfoOutlined />
                        {'휴대전화번호가 정확한지 확인해 주세요.'}
                      </FormHelperText>                            
                    }
                  </FormControl>                  
                  <Divider/>
                  <FormControl 
                    sx={{ flexGrow: 1 }} 
                    error={(!!toggleInuseEmail || !validationCheck(email, false, (value: string) => {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                      return emailRegex.test(value)
                    })) && submitted}
                  >
                    <FormLabel>이메일</FormLabel>
                    <Input
                      size="sm"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      startDecorator={<EmailRounded />}
                      placeholder="example@example.com"
                      sx={{ backgroundColor: '#ffffff' }}                      
                    />
                    {(!!toggleInuseEmail || !validationCheck(email, false, (value: string) => {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                      return emailRegex.test(value)
                    })) && submitted && 
                      <FormHelperText>
                        <InfoOutlined />
                        {toggleInuseEmail ? "이미 사용 중인 이메일입니다." : email === "" ? '필수 입력란입니다.' : '이메일 형식을 확인해주세요'}
                      </FormHelperText>
                    }
                  </FormControl>                  
                </Stack>
                <Divider/>
                <Stack direction={{ xs: 'column', lg: 'row'}} spacing={2}>
                  <FormControl sx={{ flexGrow: 1 }} error={!validationCheck(passw) && submitted}>
                    <FormLabel>비밀번호</FormLabel>
                    <Input
                      size="sm"
                      type={showPswd ? "text" : "password"}
                      startDecorator={<Password />}
                      endDecorator={<IconButton onClick={() => {setShowPswd(!showPswd)}}>{showPswd ? <Visibility/> : <VisibilityOff/>}</IconButton>}
                      placeholder="Password"
                      value={passw}
                      onChange={(e) => {setPassw(e.target.value)}}
                      sx={{ backgroundColor: '#ffffff' }}
                    />
                    {!validationCheck(passw) && submitted && 
                      <FormHelperText>
                        <InfoOutlined />
                        필수 입력란입니다.
                      </FormHelperText>                            
                    }
                  </FormControl>
                  <FormControl sx={{ flexGrow: 1 }} error={passwC !== passw && passw !== ""}>
                    <FormLabel>비밀번호 확인</FormLabel>
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
                <Button size="sm" variant="outlined" color="neutral" onClick={() => navigate('/login')}>
                  취소
                </Button>
                <Button size="sm" variant="solid" onClick={handleRegistrationClick}>
                  가입
                </Button>
              </CardActions>
            </CardOverflow>
          </Card>
        </Stack>
      </Box>
    </Sheet>
  );
};

export default SignUp;
