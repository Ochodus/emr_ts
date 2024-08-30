import GlobalStyles from '@mui/joy/GlobalStyles';
import { Box, Divider, Sheet, Stack, Tooltip } from '@mui/joy';
import IconButton from '@mui/joy/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Patient, PhysicalExam } from '../../interfaces';
import { toggleSidebar } from '../../api/commons/utils';
import { Typography } from '@mui/material';
import { ChangeCircleOutlined, Face, Face2 } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom';
import React from 'react';

const PatientDetailHeaderMui = ({ curPatient, lastPhysicalExam, setSubPage }: { curPatient: Patient & {id: number} | undefined, lastPhysicalExam: PhysicalExam | undefined, setSubPage: (page: string) => void}) => {
    const navigate = useNavigate()
    
    return (
        <Sheet
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'left',
                position: 'fixed',
                top: 0,
                width: '100vw',
                height: 'var(--Header-height)',
                zIndex: 9995,
                left: { xs: '0px', md: 'var(--Sidebar-width)'},
                p: 2,
                gap: 1,
                borderBottom: '1px solid',
                borderColor: 'background.level1',
                boxShadow: 'sm',
                transition: 'left 0.4s, width 0.4s',
            }}
        >
            <GlobalStyles
                styles={(theme) => ({
                    ':root': {
                        '--Header-height': '142px',
                        [theme.breakpoints.up('md')]: {
                            '--Header-height': '60px'
                        }
                    }
                })}
            />
            <IconButton
                onClick={() => toggleSidebar()}
                variant="outlined"
                color="neutral"
                size="sm"
                sx={{ display: { xs: "block", md: "none" } }}
            >
                <MenuIcon />
            </IconButton>
            <Stack 
                direction={{ xs: 'column', md: 'row' }}
                sx={{
                    margin: {xs: 'auto', md: 'inherit' },
                    width: {xs: '90%', md: 'auto'},
                    alignItems: 'center'
                }}
                spacing={{ xs: 1, md: 2 }}
            >   {curPatient ?                 
                <>                
                <Stack 
                    direction='row'
                    sx={{
                        alignItems: 'center',
                        minWidth: '200px'
                    }}
                    spacing={1}
                >                    
                    <Typography color='gray' fontWeight={550} component='div'>
                        {`${curPatient?.last_name}${curPatient?.first_name}`}
                    </Typography>
                    <Typography color='gray' component='div' sx={{margin: 'auto'}}>
                        {+(curPatient?.sex ?? "") === 0 ? <Face /> : <Face2 /> }, {new Date().getFullYear() - new Date(curPatient?.birthday ?? "").getFullYear()}세  {curPatient?.birthday}
                    </Typography>
                    <Tooltip title="환자 변경" variant="solid" sx={{ zIndex: 100000 }}>
                        <IconButton
                            variant='plain' 
                            onClick={() => {navigate(`../patient-detail/`)}}
                        >
                            <ChangeCircleOutlined />
                        </IconButton>
                    </Tooltip>
                </Stack>
                <Divider 
                    orientation='vertical'
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        backgroundColor: '#343a40'
                    }}
                ></Divider>
                <Divider 
                    orientation='horizontal'
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        backgroundColor: '#343a40'
                    }}
                ></Divider>
                <Stack 
                    direction='row' 
                    sx={{
                        alignItems: 'center',
                        minWidth: '335px'
                    }}
                    gap={2}
                >
                    {
                        lastPhysicalExam?.body_temperature && lastPhysicalExam?.weight && lastPhysicalExam?.height ? 
                        <React.Fragment>
                            <Stack direction='row' gap={1}>
                                <Typography fontWeight={550}>
                                    체온
                                </Typography>
                                <Typography color='gray'>
                                    {lastPhysicalExam?.body_temperature} ℃
                                </Typography>
                            </Stack>
                            <Stack direction='row' gap={1}>
                                <Typography fontWeight={550}>
                                    체중
                                </Typography>
                                <Typography color='gray'>
                                    {lastPhysicalExam?.weight} kg
                                </Typography>
                            </Stack>
                            <Stack direction='row' gap={1}>
                                <Typography fontWeight={550}>
                                    신장
                                </Typography>
                                <Typography color='gray'>
                                    {lastPhysicalExam?.height} cm
                                </Typography>
                            </Stack>
                            <Typography color='gray'>
                                ({lastPhysicalExam?.recorded.replaceAll('"', '').split('T')[0]})
                            </Typography>
                        </React.Fragment> :
                        <Typography>신체검사 내역이 없습니다.</Typography>
                    
                    }
                </Stack>
                <Divider 
                    orientation='vertical'
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        backgroundColor: '#343a40'
                    }}
                ></Divider>
                <Divider 
                    orientation='horizontal'
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        backgroundColor: '#343a40'
                    }}
                ></Divider>
                <Stack
                    direction='row' 
                    sx={{
                        alignItems: 'center',
                    }}
                    spacing={1}
                >
                    {curPatient ? 
                        <Typography fontWeight={550}>
                            보호자
                        </Typography>
                    : null
                    }
                    {curPatient ? 
                        curPatient.noks?.map((nok, index) => { 
                            return (
                                index < 2 ?
                                <Box key={index}>
                                    <Stack direction='row' 
                                        sx={{
                                            alignItems: 'center',
                                        }}
                                        spacing={1}
                                    >
                                        <Typography color='gray' fontWeight={550}>
                                            {`${nok.last_name}${nok.first_name},`}
                                        </Typography>
                                            {nok.relationship === '부' || nok.relationship === '조부' ? <Face sx={{ color: 'gray' }}/> : <Face2 sx={{ color: 'gray' }}/>}
                                        <Typography color='gray'>
                                            {`${new Date().getFullYear() - new Date(nok.birthday ?? "").getFullYear()}세`}
                                        </Typography>
                                    </Stack>
                                </Box>
                                : null
                            )
                        }) : null
                    }                    
                </Stack></> : <Typography fontWeight={550}>환자를 선택해주세요.</Typography>}
            </Stack>
        </Sheet>
    );
}

export default PatientDetailHeaderMui