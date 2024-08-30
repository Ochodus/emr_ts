import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Sheet, GlobalStyles, Box, IconButton, Typography, Input, List, ListItem, ListItemContent, Divider, Avatar, Tooltip } from '@mui/joy'
import { SearchRounded, AssignmentRounded, KeyboardArrowDown, SettingsAccessibility, Info, LogoutRounded, Home } from '@mui/icons-material';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton'
import { useLocalTokenValidation } from '../../api/commons/auth';
import { closeSidebar } from '../../api/commons/utils';
import { Patient, User } from '../../interfaces';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_BACKEND_URL, BASE_FILE_URL } from 'api/commons/request';
import { useDispatch } from 'react-redux';
import { changeAuth } from "reducers/auth";


function Toggler({
    defaultExpanded = false,
    curPatient = undefined,
    renderToggle,
    children,
  }: {
    defaultExpanded?: boolean;
    children: React.ReactNode;
    curPatient: Patient & {id: number} | undefined;
    renderToggle: (params: {
      open: boolean;
      setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    }) => React.ReactNode;
  }) {
    const [open, setOpen] = React.useState(defaultExpanded);

    useEffect(() => {
        if (curPatient === undefined) setOpen(false)
    }, [curPatient])

    return (
      <React.Fragment>
        {renderToggle({ open, setOpen })}
        <Box
          sx={{
            display: 'grid',
            gridTemplateRows: open ? '1fr' : '0fr',
            transition: '0.2s ease',
            '& > *': {
              overflow: 'hidden',
            },
          }}
        >
          {children}
        </Box>
      </React.Fragment>
    );
  }

const SideBarMui = ({ curPatient, setSubPage }: { curPatient: Patient & {id: number} | undefined, setSubPage: (s: string) => any}) => {
    const checkAuth = useLocalTokenValidation()
    const navigate = useNavigate()
    const dispatch = useDispatch();
    
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

    const getCurrentUser = useCallback(async () => {
		try {
			const response = await axios.get(`${BASE_BACKEND_URL}/api/users/me`, config)
			return response.data
		} catch (error) {
			console.error("사용자 조회 중 오류 발생:", error)
		}
	}, [config])

    const handleLogoutClick = () => {
        dispatch(changeAuth({email: "", token: ""}))
        checkAuth(".", null)
    } // 로그아웃 버튼 클릭 이벤트

    useEffect(() => {
		checkAuth(".")
		getCurrentUser().then((result) => {
            setCurrentUser(result)
        })
    }, [checkAuth, getCurrentUser])

    return (
        <div>
            <Sheet
                className="Sidebar"
                sx={{
                    position: { xs: 'fixed', md: 'sticky' },
                    transform: {
                    xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
                    md: 'none',
                    },
                    transition: 'transform 0.4s, width 0.4s',
                    zIndex: 10000,
                    height: '100dvh',
                    width: 'var(--Sidebar-width)',
                    top: 0,
                    p: 2,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <GlobalStyles
                    styles={(theme) => ({
                        ':root': {
                            '--Sidebar-width': '220px',
                            [theme.breakpoints.up('lg')]: {
                                '--Sidebar-width': '240px'
                            }
                        }
                    })}
                />
                <Box
                    className="Sidebar-overlay"
                    sx={{
                    position: 'fixed',
                    zIndex: 9998,
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    opacity: 'var(--SideNavigation-slideIn)',
                    backgroundColor: 'var(--joy-palette-background-backdrop)',
                    transition: 'opacity 0.4s',
                    transform: {
                        xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
                        lg: 'translateX(-100%)',
                    },
                    }}
                    onClick={() => closeSidebar()}
                />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <IconButton variant="soft" color="primary" size="sm" onClick={ () => navigate('../../') }>
                    <Home />
                    </IconButton>
                    <Typography level="title-lg">환자 데이터베이스</Typography>
                    {/* <ColorSchemeToggle sx={{ ml: 'auto' }} /> */}
                </Box>
                <Input size="sm" startDecorator={<SearchRounded />} placeholder="Search" />
                <Box
                    sx={{
                    minHeight: 0,
                    overflow: 'hidden auto',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    [`& .${listItemButtonClasses.root}`]: {
                        gap: 1.5,
                    },
                    }}
                >
                    <List
                        size="sm"
                        sx={{
                            gap: 1,
                            '--List-nestedInsetStart': '30px',
                            '--ListItem-radius': (theme) => theme.vars.radius.sm,
                        }}
                        >
                        <ListItem nested>
                            <Toggler
                                curPatient={curPatient}
                                renderToggle={({ open, setOpen }) => (
                                    <ListItemButton onClick={() => setOpen(!open)} disabled={curPatient === undefined}>
                                    <SettingsAccessibility />
                                    <ListItemContent>
                                        <Typography level="title-sm">환자 정보</Typography>
                                    </ListItemContent>
                                    <KeyboardArrowDown
                                        sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
                                    />
                                    </ListItemButton>
                                )}
                            >
                                <List sx={{ gap: 0.5 }}>
                                    <ListItem sx={{ mt: 0.5 }}>
                                        <ListItemButton onClick={() => setSubPage("summary")}>환자 요약 및 통계</ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemButton onClick={() => setSubPage("readingData")}>자료 열람</ListItemButton>
                                    </ListItem>
                                </List>
                            </Toggler>
                        </ListItem>
                        <ListItem nested>
                            <Toggler
                                curPatient={curPatient}
                                renderToggle={({ open, setOpen }) => (
                                    <ListItemButton onClick={() => setOpen(!open)} disabled={curPatient === undefined}>
                                    <AssignmentRounded />
                                    <ListItemContent>
                                        <Typography level="title-sm">진료 / 검사 내역</Typography>
                                    </ListItemContent>
                                    <KeyboardArrowDown
                                        sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
                                    />
                                    </ListItemButton>
                                )}
                            >
                                <List sx={{ gap: 0.5 }}>
                                    <ListItem sx={{ mt: 0.5 }}>
                                        <ListItemButton onClick={() => setSubPage("medicalRecord")}>진료 내역</ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemButton onClick={() => setSubPage("testSelect")}>검사 내역</ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemButton onClick={() => setSubPage("reportHistory")}>레포트 내역</ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemButton onClick={() => setSubPage("exerciseDetail")}>운동치료 내역</ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemButton onClick={() => setSubPage("physicalExam")}>신체검사 내역</ListItemButton>
                                    </ListItem>
                                </List>
                            </Toggler>
                        </ListItem>
                        <ListItem nested>
                            <Toggler
                                curPatient={curPatient}
                                renderToggle={({ open, setOpen }) => (
                                    <ListItemButton onClick={() => setOpen(!open)} disabled={curPatient === undefined}>
                                    <Info />
                                    <ListItemContent>
                                        <Typography level="title-sm">기타 자료</Typography>
                                    </ListItemContent>
                                    <KeyboardArrowDown
                                        sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
                                    />
                                    </ListItemButton>
                                )}
                            >
                                <List sx={{ gap: 0.5 }}>
                                    <ListItem sx={{ mt: 0.5 }}>
                                    <ListItemButton onClick={() => setSubPage("personalInformation")}>개인정보 제공 및 활용 동의서</ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                    <ListItemButton onClick={() => setSubPage("exerciseGuide")}>운동치료 안내서</ListItemButton>
                                    </ListItem>
                                </List>
                            </Toggler>
                        </ListItem>
                    </List>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Avatar
                        variant="outlined"
                        size="sm"
                        src={`${BASE_FILE_URL}${currentUser?.profile_url}`}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography level="title-sm">{`${currentUser?.last_name}${currentUser?.first_name}`}</Typography>
                        <Typography level="body-xs">{currentUser?.email}</Typography>
                    </Box>
                    <Tooltip title="로그아웃" sx={{ zIndex: 10000 }}>
                        <IconButton size="sm" variant="plain" color="neutral" onClick={() => handleLogoutClick()}>
                            <LogoutRounded />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Sheet>
        </div>
    )
}

export default SideBarMui