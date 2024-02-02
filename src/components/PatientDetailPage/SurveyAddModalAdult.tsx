import { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import styles from './SurveyAddModal.module.css'
import classNames from 'classnames/bind';

const SurveyAddModalAdult = ({show, handleClose, isNew=false, cv}: { show: boolean, handleClose: () => void, isNew?: boolean, cv: any }) => {
    const cx = classNames.bind(styles);

    const [imooveType, setImooveType] = useState("")
    const [strength, setStrength] = useState("")
    const [code, setCode] = useState("")
    const [duration, setDuration] = useState("")

    const renderSelected = () => {
    }

    const addPatient = () => {
        console.log(
            "\nType: " + imooveType,
            "\nStrength: " + strength,
            "\nCode: " + code,
            "\nDuration: " + duration,
            
        )
        handleClose()
    }

    return (
        <Modal show={show} onShow={renderSelected} onHide={handleClose} size='xl'>
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className={cx("title")}>
                        <strong><h1>설문 조사지(성인용)</h1></strong>
                    </span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <h2>기본 설문</h2>
                    <hr/>
                </div>
                <div>
                    <div>
                        <h3>방문 경로</h3>
                        <form>
                            <label><input type='checkbox' name='route' value='1'/> 지인 소개</label>
                            <label><input type='checkbox' name='route' value='2'/> 인터넷(블로그)</label>
                            <label><input type='checkbox' name='route' value='3'/> 인터넷(사이트)</label>
                            <label><input type='checkbox' name='route' value='4'/> 인터넷(카페)</label>
                            <label><input type='checkbox' name='route' value='5'/> 기타 <input type='text' placeholder="기타 사항을 입력해주세요."/></label>
                        </form>
                    </div>
                    <br/>
                    <div>
                        <h3>통증 부위</h3>
                        <form>
                            <label><input type='checkbox' name='part' value='1'/> 머리/얼굴</label>
                            <label><input type='checkbox' name='part' value='2'/> 턱</label>
                            <label><input type='checkbox' name='part' value='3'/> 목</label>
                            <label><input type='checkbox' name='part' value='4'/> 등</label>
                            <label><input type='checkbox' name='part' value='5'/> 어꺠</label>
                            <label><input type='checkbox' name='part' value='6'/> 팔꿈치</label>
                            <label><input type='checkbox' name='part' value='7'/> 손목</label>
                            <label><input type='checkbox' name='part' value='8'/> 기타 <input type='text' placeholder='기타 사항을 입력해주세요.'/></label>
                        </form>
                    </div>
                    <br/>
                    <div>
                        <h3>주 증상 부위의 통증 강도</h3>
                        <input type="range" min="1" max="10" list='num'/>
                        <datalist id="num">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                        </datalist>
                    </div>
                    <br/>
                    <div>
                        <h3>통증 발생 상황</h3>
                        <input type="text" placeholder='상세 내용'/>
                    </div>
                    <br/>
                    <div>
                        <h3>통증 시작 시기</h3>
                        <form>
                            <label><input type="radio" name="term" id="1" /> <input id='term_num' type="text" placeholder='숫자'/>일</label>
                            <label><input type="radio" name="term" id="2" /> 일주일 이상</label>
                            <label><input type="radio" name="term" id="3" /> 1개월 이상</label>
                            <label><input type="radio" name="term" id="4" /> 3개월 이상</label>
                            <label><input type="radio" name="term" id="5" /> 6개월 이상</label>
                            <label><input type="radio" name="term" id="6" /> 1년 ~ 2년</label>
                            <label><input type="radio" name="term" id="7" /> 2년 ~ 3년</label>
                            <label><input type="radio" name="term" id="8" /> 3년 ~ 5년</label>
                            <label><input type="radio" name="term" id="9" /> 기타 <input type="text" placeholder='내용을 입력해주세요'/></label>
                        </form>
                    </div>
                    <br />
                    <div>
                        <h3>방문했던 병원</h3>
                        <form>
                            <label>병원 이름 <input type="text" placeholder='상세 내용'/></label>
                            <label>받은 치료 <input type="text" placeholder='상세 내용'/></label>
                            <br />
                            <label>
                                <span>방문 빈도 </span>
                                <label><input type="radio" /> 월</label>
                                <label><input type="radio" /> 주</label>
                                <span> 회</span>
                            </label>
                        </form>
                    </div>
                    <br />
                    <div>
                        <h3>보유 질환 / 과거력</h3>
                        <form>
                            <label><input type='checkbox' name='part' value='1'/> 고혈압</label>
                            <label><input type='checkbox' name='part' value=''/> 당뇨</label>
                            <label><input type='checkbox' name='part' value=''/> 심장질환</label>
                            <label><input type='checkbox' name='part' value=''/> 간질환</label>
                            <label><input type='checkbox' name='part' value=''/> 관절질환</label>
                            <label><input type='checkbox' name='part' value=''/> 호흡기질환</label>
                            <label><input type='checkbox' name='part' value=''/> 디스크</label>
                            <label><input type='checkbox' name='part' value=''/> 우울증</label>
                            <label><input type='checkbox' name='part' value=''/> 대인기피증</label>
                            <label><input type='checkbox' name='part' value=''/> 공황장애</label>
                            <label><input type='checkbox' name='part' value=''/> 변혈 또는 기립성 저혈압</label>
                            <label><input type='checkbox' name='part' value=''/> 암</label>
                            <label><input type='checkbox' name='part' value=''/> 호르몬질환</label>
                            <label><input type="radio" name="term" id="9" /> 기타 <input type="text" placeholder='내용을 입력해주세요'/></label>
                        </form>
                    </div>
                    <br />
                    <div>
                        <h3>수술(입원) 내역</h3>
                        <form>
                            <label> 부위 <input type="text" placeholder='상세 내용'/></label>
                            <label> 기간 <input type="text" placeholder='상세 내용'/></label>
                        </form>
                    </div>
                    <br />
                    <div>
                        <h3>교통사고 내역</h3>
                        <form>
                            <label> 부위 <input type="text" placeholder='상세 내용'/></label>
                            <label> 기간 <input type="text" placeholder='상세 내용'/></label>
                        </form>
                    </div>
                    <br />
                    <div>
                        <h3>음주 / 흡연 여부</h3>
                        <form>
                            <label>
                                <input type='checkbox' name='drinksmoke' value=''/> 음주 <br />
                                <label> 주 <input type="text" placeholder='횟수'/> 회 </label><br />
                                <label> 회당  <input type="text" placeholder='횟수'/> 병 </label>
                            </label>
                                <label><input type='checkbox' name='drinksmoke' value=''/> 흡연 <br />
                                <label> 하루 <input type="text" placeholder='횟수'/> 갑 </label><br />
                            </label>
                        </form>
                    </div>
                    <br />
                    <div>
                        <form>
                            <h3>혼인 여부</h3>
                            <br />
                            <label><input type='checkbox' name='marriage' value='1'/> 기혼</label>
                            <label><input type='checkbox' name='marriage' value='2'/> 임신준비 여부</label>
                            <label><input type='checkbox' name='marriage' value='3'/> 미혼</label>
                            <h3>출산 경험</h3>
                            <br />
                            <label><input type='checkbox' name='delivery' value='3'/> 자연분만</label>
                            <label><input type='checkbox' name='delivery' value='3'/> 제왕절개</label>
                        </form>
                    </div>
                    <br />
                    <div>
                        <h3>과거에 한 운동 / 현재 하는 운동</h3>
                        <form>
                            <label> 과거 <input type="text" placeholder='상세 내용'/></label>
                            <label> 현재 <input type="text" placeholder='상세 내용'/></label>
                        </form>
                    </div>
                    <br/>
                    <div>
                        <h3>통증 시작 시기</h3>
                        <form>
                            <label><input type="radio" name="water" id="1" /> 1잔 미만</label>
                            <label><input type="radio" name="water" id="2" /> 3~5잔(500ml)</label>
                            <label><input type="radio" name="water" id="3" /> 6~10잔(1L)</label>
                            <label><input type="radio" name="water" id="4" /> 10잔 이상(2L)</label>
                        </form>
                    </div>
                    <br />
                    <div>
                        <h3>하루 식사량</h3>
                        <form>
                            <label> 하루 <input type="text"/> 끼 </label>
                            <label> 식단 <input type="text" placeholder='상세 내용'/></label>
                        </form>
                    </div>
                    <br/>
                    <div>
                        <h3>하루 평균 수면 시간 (낮잠 포함)</h3>
                        <form>
                            <label><input type="radio" name="sleep" id="1" /> 4시간 이하</label>
                            <label><input type="radio" name="sleep" id="2" /> 5~6시간</label>
                            <label><input type="radio" name="water" id="3" /> 7~8시간</label>
                            <label><input type="radio" name="water" id="4" /> 8시간</label>
                        </form>
                    </div>
                    <br/>
                    <div>
                        <h3>수면의 질(1 : 개운하게 잔다, 10 : 자주 깨고 자고 일어나면 불편하다)</h3>
                        <input type="range" min="1" max="10" list='num'/>
                        <datalist id="num">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                        </datalist>
                    </div>
                    <br />
                    <div>
                        <h3>하루 보행 시간</h3>
                        <form>
                            <label><input type='checkbox' name='walktime' value='1'/> 30분 미만</label>
                            <label><input type='checkbox' name='walktime' value='2'/> 30분 이상 ~ 1시간 미만</label>
                            <label><input type='checkbox' name='walktime' value='3'/> 1시간 이상 ~ 2시간 미만</label>
                            <label><input type='checkbox' name='walktime' value='4'/> 2시간 이상</label>
                            <label><input type='checkbox' name='walktime' value='5'/> 기타 <input type='text' placeholder="내용을 입력해주세요."/></label>
                        </form>
                    </div>
                    <br />
                    <div>
                        <form>
                            <h3>직업</h3>
                            <label><input type='text' placeholder="상세 내용"/></label>
                        </form>
                        <form>
                            <h3>하루 앉아 있는 시간</h3>
                            <label><input type='text' placeholder="상세 내용"/></label>
                        </form>
                    </div>
                    <br />
                    <div>
                        <form>
                            <h3>평소 일할 때 자세</h3>
                            <label><input type='text' placeholder="상세 내용"/></label>
                        </form>
                    </div>
                    <br />
                    <div>
                        <h3>하루 보행 시간</h3>
                        <form>
                            <label><input type="radio" name="water" id="1" /> 오른손</label>
                            <label><input type="radio" name="water" id="1" /> 왼손</label>
                            <h4>/</h4>
                            <label><input type="radio" name="water" id="1" /> 오른발</label>
                            <label><input type="radio" name="water" id="1" /> 왼발</label>
                        </form>
                    </div>
                    <br/>
                    <div>
                        <h3>복용 중인 약 또는 영양제 (선택)</h3>
                        <input type="text" placeholder='내용을 입력해주세요.'/>
                    </div>
                    <br/>
                    <div>
                        <h3>센터에서 치료를 받고 좋아지길 바라는 점 (선택)</h3>
                        <input type="text" placeholder='내용을 입력해주세요.'/>
                    </div>

                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className={cx("inline-btn")}>
                    <Button variant="primary" onClick={addPatient}>
                        {isNew ? "추가": "변경"}
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        취소
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    )
}

export default SurveyAddModalAdult
