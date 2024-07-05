import { useEffect, useState, useMemo } from "react";
import { SideBarMui, SummaryContainer } from "../components/PatientDetailPage";
import { MedicalRecord } from "../components/PatientDetailPage/subPages/MedicalRecord";
import { ReportHistory } from "../components/PatientDetailPage/subPages/ReportHistory";
import { ExerciseHistory } from "../components/PatientDetailPage/subPages/ExerciseDetail";
import { Enchiridion } from "../components/PatientDetailPage/subPages/Enchiridion";
import { TestSelection } from "../components/PatientDetailPage/subPages/InspectionHistory";
import { ExerciseGuide, PersonalInformation } from "../components/PatientDetailPage/subPages";
import { Patient, PhysicalExam } from "../interfaces";
import { useParams } from 'react-router-dom';
import { useLocalTokenValidation } from "../api/commons/auth";
import axios from 'axios';
import styles from "./PatientDetailPage.module.css";
import classNames from 'classnames/bind';
import { useDispatch } from "react-redux";
import { changeSubPage } from "../reducers/subpages";
import { PhysicalExamHistory } from "../components/PatientDetailPage/subPages/PhysicalExamHistory";
import { PatientDetailHeaderMui } from "../components/PatientDetailPage";

import { CssVarsProvider } from '@mui/joy/styles'
import CssBaseline from '@mui/joy/CssBaseline'
import { Box, Breadcrumbs, Link, Typography } from "@mui/joy";
import { ChevronRightRounded, HomeRounded } from "@mui/icons-material";

type ContainersType = {
	[index: string]: JSX.Element
	summary: JSX.Element
	testSelect: JSX.Element
	medicalRecord: JSX.Element
	exerciseGuide: JSX.Element
	exerciseDetail: JSX.Element
}



const PatientDetailPage = ({axiosMode}: {axiosMode: boolean}) => {
  const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
  const cx = classNames.bind(styles)
  const dispatch = useDispatch()

  const containers: ContainersType = {
    summary: <SummaryContainer axiosMode={axiosMode}></SummaryContainer>,
    testSelect: <TestSelection></TestSelection>,
    medicalRecord: <MedicalRecord axiosMode={axiosMode} isSummaryMode={false}></MedicalRecord>,
    exerciseGuide: <ExerciseGuide></ExerciseGuide>,
    exerciseDetail: <ExerciseHistory axiosMode={axiosMode} isSummaryMode={false}></ExerciseHistory>,
    personalInformation: <PersonalInformation></PersonalInformation>,
    readingData: <Enchiridion axiosMode={axiosMode} isSummaryMode={false}></Enchiridion>,
    reportHistory: <ReportHistory axiosMode={axiosMode} isSummaryMode={false}></ReportHistory>,
    physicalExam: <PhysicalExamHistory axiosMode={axiosMode} isSummaryMode={false}></PhysicalExamHistory>
  }

	const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])
  
    const { patient_id } = useParams();
    const [curPatient, setCurPatient] = useState<Patient & {id: number}>();
    const [lastPhysicalExam, setLastPhysicalExam] = useState<PhysicalExam>();
  
	  const [isLogin, setIsLogin] = useState(false) // 현재 로그인 여부 저장
    const [currentSubPage, setCurrentSubPage] = useState("")

    const getPatient = async () => {
      try {
        const response = await axios.get(
          `/api/patients/${patient_id}`,
          config
        )
        setCurPatient({...response.data})
      } catch (error) {
        console.error("환자 조회 중 오류 발생:", error)
      }
    }

    const getLastPhysicalExam = async () => {
      try {
        const response = await axios.get(
          `/api/patients/${patient_id}/medical/physical_exam`,
          config
        );
        setLastPhysicalExam(response.data[response.data.length-1])
      } catch (error) {
        console.error("환자 조회 중 오류 발생:", error);
      }
    }

    const handleSubPageChange = (page: string) => {
      dispatch(changeSubPage({currentSubPage: page}))
      setCurrentSubPage(page)
    }
  
    useEffect(() => {
      if (axiosMode) {
        getPatient()
        getLastPhysicalExam()
      }
      let initialSubPage = window.localStorage.getItem("persist:subpages")
      setCurrentSubPage(initialSubPage ? JSON.parse(JSON.parse(initialSubPage).currentSubPage) : null)
    }, [])

    useEffect(() => {
      let testMode = true
      if ((process.env.NODE_ENV !== 'development' || testMode) && axiosMode) checkAuth().then((resolvedData) => {
        setIsLogin(resolvedData)
      })
      }, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사
  
    return (
      <CssVarsProvider>
        <CssBaseline className={cx("contents")}>
          <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
            <SideBarMui setSubPage={handleSubPageChange}/>
            <PatientDetailHeaderMui 
              curPatient={curPatient}
              lastPhysicalExam={lastPhysicalExam}
              setSubPage={handleSubPageChange}
            />
            <Box
              component="main"
              className="MainContent"
              sx={{
                px: { xs: 2, md: 6 },
                pt: "calc(12px + var(--Header-height))",
                pb: { xs: 2, sm: 2, md: 3 },
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                height: "100dvh",
                gap: 1
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* <Breadcrumbs
                  size="sm"
                  aria-label="breadcrumbs"
                  separator={<ChevronRightRounded fontSize="small" />}
                  sx={{ pl: 0 }}
                >
                  <Link
                    underline="none"
                    color="neutral"
                    href="#some-link"
                    aria-label="Home"
                  >
                    <HomeRounded />
                  </Link>
                  <Link
                    underline="hover"
                    color="neutral"
                    href="#some-link"
                    fontSize={12}
                    fontWeight={500}
                  >
                    Dashboard
                  </Link>
                  <Typography color="primary" fontWeight={500} fontSize={12}>
                    Orders
                  </Typography>
                </Breadcrumbs> */}
              </Box>
              {containers[currentSubPage]}
            </Box>  
          </Box>
        </CssBaseline>
      </CssVarsProvider>
    );
  };
  
  export default PatientDetailPage;
  