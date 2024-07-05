import GlobalStyles from '@mui/joy/GlobalStyles';
import { Box, Divider, Sheet, Stack } from '@mui/joy';
import IconButton from '@mui/joy/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Patient, PhysicalExam } from '../../interfaces';
import styles from './PatientDetailHeader.module.css';
import classNames from 'classnames/bind';
import { toggleSidebar } from '../../api/commons/utils';
import { Typography } from '@mui/material';
import { Face, Face2 } from '@mui/icons-material'



// import { toggleSidebar } from '../utils';

const PatientDetailHeaderMui = ({ curPatient, lastPhysicalExam, setSubPage }: { curPatient: Patient & {id: number} | undefined, lastPhysicalExam: PhysicalExam | undefined, setSubPage: (page: string) => void}) => {
    const cx = classNames.bind(styles)
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
            >
                <Stack 
                    direction='row'
                    sx={{
                        alignItems: 'center',
                        minWidth: '200px'
                    }}
                    spacing={1}
                >
                    <Typography className={cx("patient-name")} component='div'>
                        {`${curPatient?.last_name}${curPatient?.first_name}`}
                    </Typography>
                    <Typography className={cx("patient-detail")} component='div' sx={{margin: 'auto'}}>
                        {+(curPatient?.sex ?? "") === 0 ? <Face /> : <Face2 /> }, {new Date().getFullYear() - new Date(curPatient?.birthday ?? "").getFullYear()}세  {curPatient?.birthday}
                    </Typography>
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
                    spacing={1}
                >
                    <Typography className={cx("patient-state")} padding='auto'>
                        체온
                    </Typography>
                    <Typography className={cx("value")}>
                        {lastPhysicalExam?.body_temperature} ℃
                    </Typography>
                    <Typography className={cx("patient-state")}>
                        체중
                    </Typography>
                    <Typography className={cx("value")}>
                        {lastPhysicalExam?.weight} kg
                    </Typography>
                    <Typography className={cx("patient-state")}>
                        신장
                    </Typography>
                    <Typography className={cx("value")}>
                        {lastPhysicalExam?.height} cm
                    </Typography>
                    <Typography className={cx("patient-state")}>
                        ({lastPhysicalExam?.recorded.replaceAll('"', '').split('T')[0]})
                    </Typography>
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
                        <Typography className={cx("patient-state")}>
                            보호자
                        </Typography>
                    : null
                    }
                    {curPatient ? 
                        curPatient.noks?.map((nok, index) => { 
                            return (
                                index < 2 ?
                                <Box>
                                    <Stack direction='row' 
                                        sx={{
                                            alignItems: 'center',
                                        }}
                                        spacing={1}
                                    >
                                        <Typography className={cx("value")}>
                                            {`${nok.last_name}${nok.first_name},`}
                                        </Typography>
                                            {nok.relationship === '부' || nok.relationship === '조부' ? <Face /> : <Face2 />}
                                        <Typography className={cx("value")}>
                                            {`${new Date().getFullYear() - new Date(nok.birthday ?? "").getFullYear()}세`}
                                        </Typography>
                                    </Stack>
                                </Box>
                                : null
                            )
                        }) : null
                    }
                </Stack>
            </Stack>
        </Sheet>
    );
}

export default PatientDetailHeaderMui