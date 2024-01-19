import { useEffect, useState, useMemo } from "react";
import { Header } from "../components/commons";
import { PatientDetailHeader, SideBar, SummaryContainer } from "../components/PatientDetailPage";
import { MedicalRecord } from "../components/PatientDetailPage/subPages/MedicalRecord";
import { ReportHistory } from "../components/PatientDetailPage/subPages/ReportHistory";
import { 
    ExerciseDetail, 
    ExerciseGuide, 
    PersonalInformation, 
    ReadingData, 
    TestSelection } from "../components/PatientDetailPage/subPages";
import { Patient } from "./PatientsTablePage";
import { useParams } from 'react-router-dom';
import { useLocalTokenValidation } from "../api/commons/auth";
import axios from 'axios';
import Card from "react-bootstrap/Card";
import styles from "./PatientDetailPage.module.css";
import classNames from 'classnames/bind';

type ContainersType = {
	[index: string]: JSX.Element
	summary: JSX.Element
	testSelect: JSX.Element
	medicalRecord: JSX.Element
	exerciseGuide: JSX.Element
	exerciseDetail: JSX.Element
}

const containers: ContainersType = {
  summary: <SummaryContainer></SummaryContainer>,
  testSelect: <TestSelection></TestSelection>,
  medicalRecord: <MedicalRecord isSummaryMode={false}></MedicalRecord>,
  exerciseGuide: <ExerciseGuide></ExerciseGuide>,
  exerciseDetail: <ExerciseDetail></ExerciseDetail>,
  personalInformation: <PersonalInformation></PersonalInformation>,
  readingData: <ReadingData></ReadingData>,
  reportHistory: <ReportHistory></ReportHistory>
}

const PatientDetailPage = () => {
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
    const cx = classNames.bind(styles);

	const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = "/api/patients";

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])
  
    const { patient_id } = useParams();
    const [curPatient, setCurPatient] = useState<Patient & {id: number}>();
  
    const [inputValue, setInputValue] = useState("");
    const [currentContainer, setCurrentContainer] = useState("summary");
  
    const [active, setActive] = useState("patient-summary"); // 초기값 설정
	const [isLogin, setIsLogin] = useState(false) // 현재 로그인 여부 저장

    const getPatient = async () => {
      try {
        const response = await axios.get(
          `/api/patients/${patient_id}`,
          config
        );
        setCurPatient(response.data)
      } catch (error) {
        console.error("환자 조회 중 오류 발생:", error);
      }
    };
  
    useEffect(() => {
      getPatient()
    }, [])

    useEffect(() => {
      let testMode = true
      if (process.env.NODE_ENV !== 'development' || testMode) checkAuth().then((resolvedData) => {
        setIsLogin(resolvedData)
      })
      }, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사
  
    return (
      <div>
        <Header isLogin={isLogin}/>
        <div className={cx("contents")}>
          <SideBar func={setCurrentContainer}/>
          <div className={cx("page-wrapper")}>
            <Card>
              <Card.Header className={cx("patient-header")}>
                <PatientDetailHeader
                  curPatient={curPatient}
                />
              </Card.Header>
              <Card.Body style={{ minHeight: "90vh", maxWidth: "100%" }}>
                {containers[currentContainer]}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    );
  };
  
  export default PatientDetailPage;
  