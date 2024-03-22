import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Main, Login, SignUp, PatientsTablePage, UserInformation, PatientDetailPage } from "./pages";

function App() {
  const axiosMode = true

  return (
    <Router basename="/onnuri">
      <Routes>
        <Route path="/"element={<Main axiosMode={axiosMode}/>}/>
        <Route path="/login" element={<Login axiosMode={axiosMode}/>} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/user-info" element={<UserInformation axiosMode={axiosMode}/>} />
        <Route path="/manage">
          <Route path="patients-table" element={<PatientsTablePage axiosMode={axiosMode}/>} />
          <Route path="patient-detail/:patient_id" element={<PatientDetailPage axiosMode={axiosMode}/>} />
        </Route>

        {/* 위의 경로 외에 다른 모든 경로에 대한 처리 */}
        <Route path="*" element={<div>없는 페이지임</div>} />
      </Routes>
    </Router>
  );
}

export default App;
