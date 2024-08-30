import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import Stack from '@mui/joy/Stack';
import Divider from '@mui/joy/Divider';
import ListItem from '@mui/joy/ListItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemContent from '@mui/joy/ListItemContent';
import Sheet from '@mui/joy/Sheet';
import Navigation from '../components/commons/Navigation'
import Layout from '../components/commons/Layout'
import { Alert, Header } from '../components/commons';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { User } from '../interfaces';
import { AdminPanelSettings, Call, CoPresent, Email, Work } from '@mui/icons-material';
import { BASE_BACKEND_URL, BASE_FILE_URL } from 'api/commons/request';

const Pending = () => {
  const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

	const config = useMemo(() => {
    return {
      headers: {
        Authorization: "Bearer " + accessToken,
      }
    }		
	}, [accessToken]) 

  const [userData, setUserData] = useState<(User & {is_active: boolean, is_admin: boolean, id: number})[]>([])
  const [pending, setPending] = useState<(User & {is_active: boolean, is_admin: boolean, id: number})[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedNav, setSelectedNav] = useState<boolean[]>([true, false])
  const [showDeletionAlert, setShowDeletionAlert] = useState<boolean>(false)
  const [showApproveAlert, setShowApproveAlert] = useState<boolean>(false)
  const [showPermAlert, setShowPermAlert] = useState<boolean>(false)

  const [targetUserId, setTargetUserId] = useState<number | null>(null)
  const [alertMessage, setAlertMessage] = useState<string>("")

  const [me , setMe] = useState<User & {id: number}>()

  const getMe = useCallback(async () => {
    try {
      let response = await axios.get(`${BASE_BACKEND_URL}/api/users/me`, config)
      setMe(response.data)
    } catch (error) {
    }
  }, [config])

  const getAllUsers = useCallback(async () => {
    try {
      let response = await axios.get(`${BASE_BACKEND_URL}/api/users`, config)
      setUserData(response.data)
      setPending(response.data)
    } catch (error) {
    }
  }, [config])

  const handleUserDelete = async (id: number) => {
    console.log(id)

    try {
      await axios.post(`${BASE_BACKEND_URL}/api/users/${id}/reject`, '', config)
      console.log("계정 삭제 성공")
      getAllUsers()
    }
    catch (error) {
      console.log("사용자 계정 삭제 실패")
      console.log(error)
    }
  }

  const handleUserApprove = async (id: number) => {
    console.log(id)
    try {
      await axios.post(`${BASE_BACKEND_URL}/api/users/${id}/accept`, '', config)
      console.log("계정 승인 성공")
      getAllUsers()
    }
    catch (error) {
      console.log("사용자 계정 승인 실패")
      console.log(error)
    }
  }

  const handleUserPerm = async (id: number) => {
    let response = await axios.get(`${BASE_BACKEND_URL}/api/users/${id}`, config)
    try {
      await axios.post(`${BASE_BACKEND_URL}/api/users/${id}/${response.data.is_admin ? 'unadmin' : 'admin'}`, '', config)
      console.log("계정 권한 변경 성공")
      getAllUsers()
    }
    catch (error) {
      console.log("계정 권한 변경 실패")
      console.log(error)
    }
  }

  useEffect(() => {
    getAllUsers()
    getMe()
  }, [getAllUsers, getMe])

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      {drawerOpen && (
        <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
          <Navigation selectedNav={selectedNav} setSelectedNav={setSelectedNav}/>
        </Layout.SideDrawer>
      )}
      <Layout.Root
        sx={{
          ...(drawerOpen && {
            height: '100vh',
            overflow: 'hidden',
          }),
        }}
      >
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.SideNav>
          <Navigation selectedNav={selectedNav} setSelectedNav={setSelectedNav}/>
        </Layout.SideNav>
        <Layout.Main>
          <List
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 2,
            }}
          >
            {selectedNav[0] && userData.map((user, index) => 
              user.is_active && user.id !== me?.id ?
              <Sheet
                key={index}
                component="li"
                variant="outlined"
                sx={{
                  borderRadius: 'sm',
                  p: 2,
                  listStyle: 'none',
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar
                    variant="outlined"
                    src={`${BASE_FILE_URL}${user.profile_url}`}
                    sx={{ borderRadius: '50%' }}
                  />
                  <div>
                    <Typography level="title-md">{`${user.last_name} ${user.first_name}`}</Typography>
                    <Stack direction='row' gap={2}>
                      <Typography startDecorator={<CoPresent/>} level="body-xs">{user.position}</Typography>
                      <Typography startDecorator={<Work/>} level="body-xs">{user.department}</Typography>
                      <Typography startDecorator={<AdminPanelSettings/>} level="body-xs">{`${user.is_admin ? '관리자' : '일반' }`}</Typography>
                    </Stack>                    
                  </div>
                </Box>
                <Divider component="div" sx={{ my: 2 }} />
                <List sx={{ '--ListItemDecorator-size': '40px', gap: 2 }}>
                    <ListItem sx={{ alignItems: 'flex-start' }}>
                      <ListItemDecorator
                        sx={{
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            height: '100%',
                            width: '1px',
                            bgcolor: 'divider',
                            left: 'calc(var(--ListItem-paddingLeft) + 12px)',
                            top: '50%',
                          },
                        }}
                      >
                        <Call></Call>
                      </ListItemDecorator>
                      <ListItemContent>
                        <Typography level="title-sm">Phone Number</Typography>
                        <Typography level="body-xs">{user.phone_number}</Typography>
                      </ListItemContent>
                    </ListItem>
                    <ListItem sx={{ alignItems: 'flex-start' }}>
                      <ListItemDecorator
                        sx={{
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            height: '100%',
                            width: '1px',
                            bgcolor: 'divider',
                            left: 'calc(var(--ListItem-paddingLeft) + 12px)',
                            top: '50%',
                          },
                        }}
                      >
                        <Email />
                      </ListItemDecorator>
                      <ListItemContent>
                        <Typography level="title-sm">Email</Typography>
                        <Typography level="body-xs">{user.email}</Typography>
                      </ListItemContent>
                    </ListItem>
                </List>
                <Divider component="div" sx={{ my: 2 }} />
                <Stack direction='row' sx={{ justifyContent: 'space-between' }}>
                  <Button
                    variant='soft'
                    size="sm"
                    sx={{ px: 2, mt: 1 }}
                    onClick={() => {
                      setAlertMessage(`해당 계정의 권한을 ${user.is_admin ? '관리자' : '일반'}에서 ${user.is_admin ? '일반' : '관리자'}로 변경하시겠습니까?`)
                      setTargetUserId(user.id)
                      setShowPermAlert(true)
                    }}
                  >권한 변경</Button>
                  <Button
                    variant='outlined'
                    size="sm"
                    sx={{ px: 2, mt: 1 }}
                    color='danger'
                    onClick={() => {
                      setAlertMessage('해당 계정을 정말로 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.')
                      setTargetUserId(user.id)
                      setShowDeletionAlert(true)
                    }}
                  >삭제하기</Button>
                </Stack>                
              </Sheet> : null
            )}
            {selectedNav[1] && pending.map((user, index) => 
                  !user.is_active ? <Sheet
                    key={index}
                    component="li"
                    variant="outlined"
                    sx={{
                      borderRadius: 'sm',
                      p: 2,
                      listStyle: 'none',
                    }}
                  >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                      variant="outlined"
                      src={`${BASE_FILE_URL}${user.profile_url}`}
                      sx={{ borderRadius: '50%' }}
                    />
                    <div>
                      <Typography level="title-md">{`${user.last_name} ${user.first_name}`}</Typography>
                      <Stack direction='row' gap={2}>
                        <Typography startDecorator={<CoPresent/>} level="body-xs">{user.position}</Typography>
                        <Typography startDecorator={<Work/>} level="body-xs">{user.department}</Typography>
                      </Stack>                    
                    </div>
                  </Box>
                  <Divider component="div" sx={{ my: 2 }} />
                  <List sx={{ '--ListItemDecorator-size': '40px', gap: 2 }}>
                    <ListItem sx={{ alignItems: 'flex-start' }}>
                      <ListItemDecorator
                        sx={{
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            height: '100%',
                            width: '1px',
                            bgcolor: 'divider',
                            left: 'calc(var(--ListItem-paddingLeft) + 12px)',
                            top: '50%',
                          },
                        }}
                      >
                        <Call></Call>
                      </ListItemDecorator>
                      <ListItemContent>
                        <Typography level="title-sm">Phone Number</Typography>
                        <Typography level="body-xs">{user.phone_number}</Typography>
                      </ListItemContent>
                    </ListItem>
                    <ListItem sx={{ alignItems: 'flex-start' }}>
                      <ListItemDecorator
                        sx={{
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            height: '100%',
                            width: '1px',
                            bgcolor: 'divider',
                            left: 'calc(var(--ListItem-paddingLeft) + 12px)',
                            top: '50%',
                          },
                        }}
                      >
                        <Email />
                      </ListItemDecorator>
                      <ListItemContent>
                        <Typography level="title-sm">Email</Typography>
                        <Typography level="body-xs">{user.email}</Typography>
                      </ListItemContent>
                    </ListItem>
                  </List>
                  <Divider component="div" sx={{ my: 2 }} />
                  <Stack direction='row' sx={{ justifyContent: 'space-between' }}>
                    <Button
                      variant='soft'
                      size="sm"
                      sx={{ px: 2, mt: 1 }}
                      onClick={() => {
                        setAlertMessage('해당 가입 요청을 승인하시겠습니까?')
                        setTargetUserId(user.id)
                        setShowApproveAlert(true)
                      }}
                    >수락</Button>
                    <Button
                      variant='outlined'
                      size="sm"
                      sx={{ px: 2, mt: 1 }}
                      color='danger'
                      onClick={() => {
                        setAlertMessage('해당 가입 요청을 정말 거부하시겠습니까? 거부하면 가입이 취소됩니다.')
                        setTargetUserId(user.id)
                        setShowDeletionAlert(true)
                      }}
                    >거부</Button>
                  </Stack>                
                </Sheet> : null
              )}              
          </List>          
          <Alert 
            message={alertMessage}
            showDeletionAlert={showDeletionAlert} 
            setShowDeletionAlert={(e: React.SetStateAction<boolean>) => {if (e === false) setTargetUserId(null); setShowDeletionAlert(e)}} 
            deleteFunction={() => {
              if (targetUserId) handleUserDelete(targetUserId)
              setTargetUserId(null)
              setShowDeletionAlert(false)
            }}
          />
          <Alert 
            message={alertMessage}
            showDeletionAlert={showApproveAlert} 
            setShowDeletionAlert={(e: React.SetStateAction<boolean>) => {if (e === false) setTargetUserId(null); setShowApproveAlert(e)}} 
            deleteFunction={() => {
              if (targetUserId) handleUserApprove(targetUserId)
              setTargetUserId(null)
              setShowApproveAlert(false)
            }}
          />
          <Alert 
            message={alertMessage}
            showDeletionAlert={showPermAlert} 
            setShowDeletionAlert={(e: React.SetStateAction<boolean>) => {if (e === false) setTargetUserId(null); setShowPermAlert(e)}} 
            deleteFunction={() => {
              if (targetUserId) handleUserPerm(targetUserId)
              setTargetUserId(null)
              setShowPermAlert(false)
            }}
          />
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}

export default Pending