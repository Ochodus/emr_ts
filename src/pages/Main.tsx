import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/commons"
import { CssVarsProvider } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import CssBaseline from '@mui/joy/CssBaseline';
import Typography, { typographyClasses } from '@mui/joy/Typography';
import { AspectRatio, Container, Divider, Stack} from "@mui/joy";
import axios from "axios";
import { BASE_BACKEND_URL } from "api/commons/request";
import { useLocalTokenValidation } from "api/commons/auth";
import { User } from "interfaces";


const Main = () => {
  const auth = window.localStorage.getItem("persist:auth")
  const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

  const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			}
		}
  }, [accessToken]);
  
  const checkAuth = useLocalTokenValidation()
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState<User & {is_active: boolean, is_admin: boolean} | null>(null)
  const [prevHovered, setPrevHovered] = useState<number>(0)
  const [lastHovered, setLastHovered] = useState<number>(0)
  const [cardFlipFlag, setCardFlipFlag] = useState<boolean>(false)

  const getCurrentUser = useCallback(async () => {
		try {
			const response = await axios.get(`${BASE_BACKEND_URL}/api/users/me`, config)
			return response.data
		} catch (error) {
			console.error("사용자 조회 중 오류 발생:", error)
		}
	}, [config])

  useEffect(() => {
		getCurrentUser().then((result) => {
			setCurrentUser(result as User & {is_active: boolean, is_admin: boolean})
		})
	}, [checkAuth, getCurrentUser]) // 페이지 첫 렌더링 시 localStorage의 로그인 정보 유효성 검사 수행

  return (
    <CssVarsProvider>
      <CssBaseline />
      <Header></Header>
      <Box
        sx={{
          height: '100vh',
          overflowY: 'auto'
        }}
      >
        <TwoSidedLayout img={lastHovered} prev={prevHovered} flippedFlag={cardFlipFlag}>
          <Stack 
            gap={4} 
            onClick={() => navigate("/manage/patient-detail")} 
            onMouseEnter={() => {if (0 !== lastHovered) setCardFlipFlag(!cardFlipFlag); setPrevHovered(lastHovered); setLastHovered(0)}}
            sx={{ 
              width: '100%',
              px: 2,
              py: 5,
              backgroundColor: 'rgb(1, 1, 1, 0.0)',
              "&:hover": {
                backgroundColor: 'rgb(1, 1, 1, 0.1)',
              },
              transition: 'background-color 0.2s ease',
              borderRadius: '10px'
            }}
          >
            <Typography
              level="h1"
              fontWeight="xl"
              fontSize="clamp(1.875rem, 1.3636rem + 2.1818vw, 3rem)"
            >
              환자 관리 시스템
            </Typography>
            <Typography fontSize="lg" textColor="text.secondary" lineHeight="lg">
              진료 기록, 환자 정보 관리 및 수정
            </Typography>
          </Stack>
          <Divider></Divider>
          <Stack 
            gap={4}  
            onClick={() => navigate("/status")}
            onMouseEnter={() => {if (1 !== lastHovered) setCardFlipFlag(!cardFlipFlag); setPrevHovered(lastHovered); setLastHovered(1)}}
            sx={{ 
              width: '100%',
              px: 2,
              py: 5,
              "&:hover": {
                backgroundColor: 'rgb(1, 1, 1, 0.1)',
              },
              transition: 'background-Color 0.2s ease',
              borderRadius: '10px'
            }}
          >
            <Typography
              level="h1"
              fontWeight="xl"
              fontSize="clamp(1.875rem, 1.3636rem + 2.1818vw, 3rem)"
            >
              데이터 통계 시스템
            </Typography>
            <Typography fontSize="lg" textColor="text.secondary" lineHeight="lg">
              환자 데이터 기반 통계 확인
            </Typography>
          </Stack>
          <Divider sx={{ display: currentUser?.is_admin ? 'block' : 'none' }}></Divider>
          <Stack 
            gap={4}  
            onClick={() => navigate("/pending")}
            onMouseEnter={() => {if (2 !== lastHovered) setCardFlipFlag(!cardFlipFlag); setPrevHovered(lastHovered); setLastHovered(2)}}
            sx={{ 
              display: currentUser?.is_admin ? 'block' : 'none',
              width: '100%',
              px: 2,
              py: 5,
              "&:hover": {
                backgroundColor: 'rgb(1, 1, 1, 0.1)',
              },
              transition: 'background-Color 0.2s ease',
              borderRadius: '10px'
            }}
          >
            <Typography
              level="h1"
              fontWeight="xl"
              fontSize="clamp(1.875rem, 1.3636rem + 2.1818vw, 3rem)"
            >
              사용자 관리
            </Typography>
            <Typography fontSize="lg" textColor="text.secondary" lineHeight="lg">
              가입 승인/거절 및 권한 관리
            </Typography>
          </Stack>
        </TwoSidedLayout>
      </Box>
    </CssVarsProvider>
  );
};

export function TwoSidedLayout({
  children,
  reversed,
  img,
  prev,
  flippedFlag
}: React.PropsWithChildren<{ reversed?: boolean, img?: number, prev?: number, flippedFlag: boolean }>) {

  return (
    <Container
      sx={(theme) => ({
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: reversed ? 'column-reverse' : 'column',
        alignItems: 'center',
        gap: 4,
        [theme.breakpoints.up(834)]: {
          flexDirection: 'row',
          gap: 6,
        },
        [theme.breakpoints.up(1199)]: {
          gap: 12,
        },
      })}
    >
      <Box
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '50ch',
          textAlign: 'center',
          flexShrink: 999,
          [theme.breakpoints.up(834)]: {
            minWidth: 420,
            alignItems: 'flex-start',
            textAlign: 'initial',
          },
          [`& .${typographyClasses.root}`]: {
            textWrap: 'balance',
          },
        })}
      >
        {children}
      </Box>
      <AspectRatio
        className={`${['manage', 'status', 'pending'][prev ?? 0]}to${['manage', 'status', 'pending'][img ?? 0]}`}
        ratio={600 / 520}
        variant="outlined"
        maxHeight={300}
        sx={(theme) => ({
          minWidth: 300,
          alignSelf: 'stretch',
          [theme.breakpoints.up(834)]: {
            alignSelf: 'initial',
            flexGrow: 1,
            '--AspectRatio-maxHeight': '520px',
            '--AspectRatio-minHeight': '400px',
          },
          borderRadius: 'sm',
          bgcolor: 'background.level2',
          flexBasis: '50%',
          opacity: '0.8',
        })}
      >
      </AspectRatio>
    </Container>
  );
}

export default Main;
