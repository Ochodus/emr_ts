import React, { useEffect, useState } from 'react'
import { Sheet, GlobalStyles, Box, IconButton, Typography, Input, List, ListItem, ListItemContent, Divider, Avatar } from '@mui/joy'
import { BrightnessAutoRounded, SearchRounded, AssignmentRounded, KeyboardArrowDown, SettingsAccessibility, Info, LogoutRounded } from '@mui/icons-material';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton'
import { useLocalTokenValidation } from '../../api/commons/auth';
import { useRequestAPI } from '../../api/commons/request';
import { CurrentUser } from '../../pages/UserInformation';
import { closeSidebar } from '../../api/commons/utils';

const { Sidebar, Menu, SubMenu, MenuItem, menuClasses } = require('react-pro-sidebar');

function Toggler({
    defaultExpanded = false,
    renderToggle,
    children,
  }: {
    defaultExpanded?: boolean;
    children: React.ReactNode;
    renderToggle: (params: {
      open: boolean;
      setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    }) => React.ReactNode;
  }) {
    const [open, setOpen] = React.useState(defaultExpanded);
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

const SideBarMui = ({ setSubPage }: { setSubPage: (s: string) => any}) => {
    const checkAuth = useLocalTokenValidation()
    const request = useRequestAPI()
    const auth = JSON.parse(window.localStorage.getItem("persist:auth") ?? "[]")
    
    const [currentUser, setCurrentUser] = useState<CurrentUser>()

    const handleResponsedUserData = (data: any) => {
		console.log(data)
		setCurrentUser({
			name: [data.last_name, data.first_name],
			phoneNumber: ['010', data.phone_number.split('-')[1], data.phone_number.split('-')[2]],
			email: [...data.email.split('@'), "직접 입력"],
			gender: `${data.sex}`,
			selectedPosition: data.position,
			selectedDepartment: data.department,
			userIconUrl: data.profile_url
		})
	}

    useEffect(() => {
        checkAuth(".")
		request("/api/users/me", 'get', undefined, handleResponsedUserData)
    }, [])

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
                    <IconButton variant="soft" color="primary" size="sm">
                    <BrightnessAutoRounded />
                    </IconButton>
                    <Typography level="title-lg">환자 상세</Typography>
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
                                    renderToggle={({ open, setOpen }) => (
                                        <ListItemButton onClick={() => setOpen(!open)}>
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
                                renderToggle={({ open, setOpen }) => (
                                    <ListItemButton onClick={() => setOpen(!open)}>
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
                                    renderToggle={({ open, setOpen }) => (
                                        <ListItemButton onClick={() => setOpen(!open)}>
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
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286"
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography level="title-sm">{currentUser?.name}</Typography>
                        <Typography level="body-xs">{currentUser?.email}</Typography>
                    </Box>
                    <IconButton size="sm" variant="plain" color="neutral">
                        <LogoutRounded />
                    </IconButton>
                </Box>
            </Sheet>
        </div>
    )
}

export default SideBarMui