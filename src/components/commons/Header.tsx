import { useNavigate } from "react-router-dom";
import { Avatar, Box, IconButton, Typography } from "@mui/joy";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalTokenValidation } from "api/commons/auth";
import { LogoutRounded } from "@mui/icons-material";
import { User } from "interfaces";
import axios from "axios";
import { BASE_BACKEND_URL } from "api/commons/request";
import { changeAuth } from "reducers/auth";
import { useDispatch } from "react-redux";

const HeaderMain = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const checkAuth = useLocalTokenValidation()

    const auth = window.localStorage.getItem("persist:auth")
    const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

    const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			}
		}
    }, [accessToken]);

    const [currentUser, setCurrentUser] = useState<User>()

    const handleLogoutClick = () => {
        dispatch(changeAuth({email: "", token: ""}))
        checkAuth(".", null)
    } // 로그아웃 버튼 클릭 이벤트
    
    const getCurrentUser = useCallback(async () => {
		try {
			const response = await axios.get(`${BASE_BACKEND_URL}/api/users/me`, config)
			return response.data
		} catch (error) {
			console.error("사용자 조회 중 오류 발생:", error)
		}
	}, [config])

    useEffect(() => {
        checkAuth(".")
		getCurrentUser().then((result) => {
            setCurrentUser(result)
        })
    }, [checkAuth, getCurrentUser])

    return (
            <Box
                sx={{
                    position: 'fixed',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    top: 0,
                    px: 1.5,
                    py: 1,
                    zIndex: 10000,
                    backgroundColor: 'background.body',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    height: '60px'
                }}
                >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 1.5,
                        height: '100%'
                    }}
                >
                    <IconButton
                        size="sm"
                        onClick={() => navigate('/')}
                        sx={{
                            pl: 3,
                            height: '80%'
                        }}
                    >
                        <img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="" style={{ height: '100%', objectFit: 'contain' }}></img>
                    </IconButton>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
                    <Box
                    sx={{
                        gap: 1,
                        alignItems: 'center',
                        display: { xs: 'none', sm: 'flex' },
                        pr: 1
                    }}
                    >
                        <Avatar
                            variant="outlined"
                            size="sm"
                            src={currentUser?.profile_url}
                            onClick={() => navigate('/user-info')}
                        />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography level="title-sm">{`${currentUser?.last_name}${currentUser?.first_name}`}</Typography>
                            <Typography level="body-xs">{currentUser?.email}</Typography>
                        </Box>
                        <IconButton size="sm" variant="plain" color="neutral" sx={{ ml: 3 }} onClick={() => handleLogoutClick()}>
                            <LogoutRounded />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
    )
}

export default HeaderMain;

