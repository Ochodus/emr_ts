import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Main, Login, SignUp, UserInformation, PatientDetailPage, Pending } from "./pages";

import {
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
  experimental_extendTheme as extendMaterialTheme,
  THEME_ID
} from "@mui/material/styles";
import {
  CssVarsProvider as JoyCssVarsProvider,
} from "@mui/joy/styles";

const materialTheme = extendMaterialTheme();

function App() {
  const axiosMode = true

  return (
    <MaterialCssVarsProvider theme={{ [THEME_ID]: materialTheme }}>
      <JoyCssVarsProvider>
        <Router basename="/onnuri">
          <Routes>
            <Route path="/"element={<Main />}/>
            <Route path="/login" element={<Login axiosMode={axiosMode}/>} />
            <Route path="/signup" element={<SignUp/>} />
            <Route path="/user-info" element={<UserInformation axiosMode={axiosMode}/>} />
            <Route path="/manage">
              <Route path="patient-detail" element={<PatientDetailPage axiosMode={axiosMode}/>} />
              <Route path="patient-detail/:patient_id" element={<PatientDetailPage axiosMode={axiosMode}/>} />
            </Route>
            <Route path="/pending" element={<Pending/>} />
          <Route path="*" element={<div>없는 페이지임</div>} />
        </Routes>
      </Router>
      </JoyCssVarsProvider>
    </MaterialCssVarsProvider>
  );
}

export default App;
