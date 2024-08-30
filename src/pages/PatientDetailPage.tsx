import { useEffect, useState, useMemo, useCallback } from "react";
import { SideBarMui, SummaryContainer } from "../components/PatientDetailPage";
import { MedicalRecord } from "../components/PatientDetailPage/subPages/MedicalRecord";
import { ReportHistory } from "../components/PatientDetailPage/subPages/ReportHistory";
import { ExerciseHistory } from "../components/PatientDetailPage/subPages/ExerciseDetail";
import { Enchiridion } from "../components/PatientDetailPage/subPages/Enchiridion";
import { TestSelection } from "../components/PatientDetailPage/subPages/InspectionHistory";
import { ExerciseGuide, PersonalInformation } from "../components/PatientDetailPage/subPages";
import { Patient, PhysicalExam } from "../interfaces";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from "react-redux";
import { changeSubPage } from "../reducers/subpages";
import { PhysicalExamHistory } from "../components/PatientDetailPage/subPages/PhysicalExamHistory";
import { PatientDetailHeaderMui } from "../components/PatientDetailPage";
import { CssVarsProvider } from '@mui/joy/styles'
import CssBaseline from '@mui/joy/CssBaseline'
import { Box } from "@mui/joy";
import { PatientsTable } from "../components/PatientDetailPage/subPages/PatientsTable";
import { ID } from "../components/commons/TableMui";
import { BASE_BACKEND_URL } from "api/commons/request";


type ContainersType = {
	[index: string]: JSX.Element
	summary: JSX.Element
	testSelect: JSX.Element
	medicalRecord: JSX.Element
	exerciseGuide: JSX.Element
	exerciseDetail: JSX.Element
}

const PatientDetailPage = ({axiosMode}: {axiosMode: boolean}) => {
  const dispatch = useDispatch()
  const { patient_id } = useParams();

  const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

  const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])
    
  const [curPatient, setCurPatient] = useState<Patient & ID>();
  const [lastPhysicalExam, setLastPhysicalExam] = useState<PhysicalExam>()
  const [currentSubPage, setCurrentSubPage] = useState("")

  const getPatient = useCallback(async () => {
    if (patient_id === undefined) {setCurPatient(undefined); return}
    try {
      const response = await axios.get(
        `${BASE_BACKEND_URL}/api/patients/${patient_id}`,
        config
      )
      setCurPatient({...response.data})
    } catch (error) {
      console.error("환자 조회 중 오류 발생:", error)
    }
  }, [config, patient_id])

  const getLastPhysicalExam = useCallback(async () => {
    if (patient_id === undefined) {setCurPatient(undefined); return}
    try {
      const response = await axios.get(
        `${BASE_BACKEND_URL}/api/patients/${patient_id}/medical/physical_exam`,
        config
      );
      setLastPhysicalExam(response.data[response.data.length-1])
    } catch (error) {
      console.error("환자 조회 중 오류 발생:", error);
    }
  }, [config, patient_id])

  const containers: ContainersType = {
    summary: <SummaryContainer axiosMode={axiosMode} store></SummaryContainer>,
    testSelect: <TestSelection></TestSelection>,
    medicalRecord: <MedicalRecord axiosMode={axiosMode} isSummaryMode={false}></MedicalRecord>,
    exerciseGuide: <ExerciseGuide></ExerciseGuide>,
    exerciseDetail: <ExerciseHistory axiosMode={axiosMode}></ExerciseHistory>,
    personalInformation: <PersonalInformation></PersonalInformation>,
    readingData: <Enchiridion axiosMode={axiosMode} isSummaryMode={false}></Enchiridion>,
    reportHistory: <ReportHistory axiosMode={axiosMode}></ReportHistory>,
    physicalExam: <PhysicalExamHistory axiosMode={axiosMode} renewPatient={getLastPhysicalExam}></PhysicalExamHistory>
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
  }, [axiosMode, getLastPhysicalExam, getPatient])

    return (
      <CssVarsProvider>
        <CssBaseline>
          <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
            <SideBarMui curPatient={curPatient} setSubPage={handleSubPageChange}/>
            <PatientDetailHeaderMui 
              curPatient={curPatient}
              lastPhysicalExam={lastPhysicalExam}
              setSubPage={handleSubPageChange}
            />
            <Box
              component="main"
              className="MainContent"
              sx={{
                pt: "calc(var(--Header-height))",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                height: "100dvh",
                gap: 1
              }}
            >
              {curPatient ? containers[currentSubPage] : <PatientsTable isSummaryMode={false} axiosMode={axiosMode}></PatientsTable>}
            </Box>  
          </Box>
        </CssBaseline>
      </CssVarsProvider>
    );
  };
  
  export default PatientDetailPage;
  