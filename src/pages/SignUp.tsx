import { useState } from "react";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup'
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './SignUp.module.css'
import classNames from 'classnames/bind';

const SignUp = () => {
  const cx = classNames.bind(styles)
  const navigate = useNavigate()

  const [FirstName, setFirstName] = useState("")
  const [SecondName, setSecondName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneN, setPhoneN] = useState(["", "", ""])
  const [passw, setPassw] = useState("")
  const [passwC, setPasswC] = useState("")
  const [showPswd, setShowPswd] = useState("")
  const [selectedPosition, setSelectedPosition] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")

  const [accessToken, setAccessToken] = useState("") // 액세스 토큰 상태 추가

  const [isTriedToSignUp, setIsTriedToSignUp] = useState(false) // 회원 가입 시도 여부
  const [isFormValid, setIsFormValid] = useState({name: false, phoneN: false, email: false, passw: false, passwC: false})

  const handleRegistrationClick = () => {
    setIsTriedToSignUp(true)
    if (!formValidationCheck()) {
      alert("유효하지 않은 입력 필드가 있습니다.")
      return
    }
    post_signup()
  } // 회원 가입 버튼 클릭 시 이벤트

  const setPositionChange = (e: string) => {
    setSelectedPosition(e)
  } 

  const formValidationCheck = () => {
    let nameCheck = FirstName !== "" && SecondName !== ""
    let phoneNCheck = phoneN[1] !== "" && phoneN[2] !== ""
    let emailCheck = email !== ""
    let passwCheck = passw !== ""
    let passwCCheck = passw === passwC

    setIsFormValid({
      ...isFormValid, 
      name: nameCheck,
      phoneN: phoneNCheck,
      email: emailCheck,
      passw: passwCheck,
      passwC: passwCCheck
    })

    return nameCheck && phoneNCheck && emailCheck && passwCheck && passwCCheck
  } // 회원 가입 폼 유효성 검사

  const post_signup = async () => {
    try {
      const response = await axios.post(
        "/api/auth/signup",
        {
          email: email,
          password: passw,
          first_name: FirstName,
          last_name: SecondName,
          position: selectedPosition,
          sex: 0,
          phone_number: `${phoneN[0]}-${phoneN[1]}-${phoneN[2]}`,
          department: selectedDepartment,
        }
      )

      const token = response.data
      setAccessToken(token) // 액세스 토큰을 상태로 저장

      console.log("성공 - 액세스 토큰:", token)
      alert("회원가입 성공!");
      navigate('/login');
    } catch (error) {
      console.error("회원 가입 중 오류 발생:", error)
    }
  } // 회원 가입 벡앤드 요청

  return (
    <div className={cx('structure-signup')}>
        <img id={cx('logo-signup-page')} src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="doctor" />
        <div id={cx('field-signup')}>
            <div id={cx('text-detail-signup')}>
                <h3>사용자 등록</h3>
                <p>병원 관계자만 회원 가입이 가능합니다.</p>
            </div>
            <Form id={cx('input-group-signup')}>
              <div className={cx("row-group")}>
                <div className={cx("inline")}>
                  <div className={`${cx("cell")}`}>
                    <InputGroup>
                      <InputGroup.Text className={cx("input-label")}>성명</InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="성"
                        value={SecondName}
                        size="sm"
                        onChange={(e) => setSecondName(e.target.value)}
                      />
                      <Form.Control
                        type="text"
                        placeholder="이름"
                        value={FirstName}
                        size="sm"
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </InputGroup>
                  </div>
                </div>
                {isFormValid.name || !isTriedToSignUp ? null : <div className={cx("form-unvalid-msg")}>* 필수 입력란입니다.</div>}
                <div className={cx("inline")}>
                  <div className={`${cx("cell")}`}>
                    <InputGroup>
                      <InputGroup.Text className={cx("input-label")}>전화번호</InputGroup.Text>
                      <Form.Select
                        value={phoneN[0]}
                        onChange={(e) => setPhoneN([e.target.value, phoneN[1], phoneN[2]])}
                      >
                          <option>010</option>
                      </Form.Select>
                      <div className={cx("dash")}> - </div>
                      <Form.Control
                        type="number"
                        className={cx("phoneNumber")}
                        value={phoneN[1]}
                        onChange={(e) => setPhoneN([phoneN[0], e.target.value, phoneN[2]])}
                      >
                      </Form.Control>
                      <div className={cx("dash")}> - </div>
                      <Form.Control
                          type="number"
                          className={cx("phoneNumber")}
                          value={phoneN[2]}
                        onChange={(e) => setPhoneN([phoneN[0], phoneN[1], e.target.value])}
                      >
                      </Form.Control>
                    </InputGroup>
                  </div>
                </div>
                {isFormValid.phoneN || !isTriedToSignUp ? null : <div className={cx("form-unvalid-msg")}>* 필수 입력란입니다.</div>}
              </div>
              <div className={cx("row-group")}>
              <div className={cx("inline")}>
                  <div className={`${cx("cell")}`}>
                    <InputGroup>
                      <InputGroup.Text className={cx("input-label")}>이메일</InputGroup.Text>
                      <Form.Control
                        type="email"
                        placeholder="example@onnuri.com"
                        value={email}
                        size="sm"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </InputGroup>
                  </div>
                </div>
                {isFormValid.email || !isTriedToSignUp ? null : <div className={cx("form-unvalid-msg")}>* 필수 입력란입니다.</div>}
                <div className={cx("inline")}>
                  <div className={`${cx("cell")}`}>
                    <InputGroup>
                      <InputGroup.Text className={cx("input-label")}>비밀번호</InputGroup.Text>
                      <Form.Control
                        type="password"
                        placeholder=""
                        value={passw}
                        size="sm"
                        onChange={(e) => setPassw(e.target.value)}
                      />
                    </InputGroup>
                  </div>
                </div>
                {isFormValid.passw || !isTriedToSignUp ? null : <div className={cx("form-unvalid-msg")}>* 필수 입력란입니다.</div>}
                <div className={cx("inline")}>
                  <div className={`${cx("cell")}`}>
                    <InputGroup>
                      <InputGroup.Text className={cx("input-label")}>비밀번호 확인</InputGroup.Text>
                      <Form.Control
                        type="password"
                        placeholder=""
                        value={passwC}
                        size="sm"
                        onChange={(e) => {
                          setPasswC(e.target.value)
                        }}
                      />
                    </InputGroup>
                  </div>
                </div>
                {passw === passwC || passwC === "" ? null : <div className={cx("form-unvalid-msg")}>* 비밀번호가 일치하지 않습니다.</div>}
              </div>
              <div className={cx("row-group")}>
                <div className={cx("inline")}>
                  <div className={`${cx("cell")}`}>
                    <InputGroup>
                      <InputGroup.Text className={cx("input-label")}>직위</InputGroup.Text>
                      <Form.Select
                        value={selectedPosition}
                        size="sm"
                        onChange={(e) => setPositionChange(e.target.value)}
                      >
                        <option>원장</option>
                        <option>국장</option>
                        <option>간호조무사</option>
                        <option>물리치료사</option>
                      </Form.Select>
                    </InputGroup>
                  </div>
                  <div className={`${cx("cell")} ${cx("blank")}`}></div>
                  <div className={`${cx("cell")}`}>
                    <InputGroup>
                      <InputGroup.Text className={cx("input-label")}>부서</InputGroup.Text>
                      <Form.Select
                        value={selectedDepartment}
                        size="sm"
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                      >
                        <option>통증</option>
                        <option>센터</option>
                      </Form.Select>
                    </InputGroup>
                  </div>
                </div>
              </div>
              <div className={cx("btn-group-submit")}>
                <Button variant="secondary" className={cx('btn-signup-exit')} size="lg" onClick={() => navigate('/login')}>
                  돌아가기
                </Button>
                <Button variant="info" className={cx('btn-signup-confirm')} size="lg" onClick={handleRegistrationClick}>
                  가입하기
                </Button>
              </div>
            </Form>
        </div>
    </div>
  );
};

export default SignUp;
