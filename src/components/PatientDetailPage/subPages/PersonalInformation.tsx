import React, { useState } from "react";

const PersonalInformation = () => {
  const [year, setYear] = useState("");
  const [num, setNum] = useState("");
  const [relation, setRelation] = useState("");
  const [agent, setAgent] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, stateUpdater: React.Dispatch<React.SetStateAction<string>>) => {
    // 입력한 값을 상태에 업데이트
    stateUpdater(event.target.value);
    setInputValue(event.target.value); // 입력된 값을 저장하는 상태 업데이트
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, stateUpdater: React.Dispatch<React.SetStateAction<string>>) => {
    if (event.key === "Enter" || event.key === " ") {
      console.log("입력 내용:", inputValue);
      stateUpdater(inputValue);
    }
  };

  return (
    <div className="detail-structure">
      <div style={{ paddingTop: "20px", paddingLeft: "40px", paddingRight: "40px" }}>
        <div style={{ backgroundColor: "white", padding: "25px", fontSize: "25px", fontWeight: 600,}}>
          온누리마취통증의학과는
          <div
            style={{
              marginTop: "5px",
              border: "2px solid black",
              textAlign: "left",
              fontSize: "17px",
              fontWeight: 400,
              padding: "30px",
            }}
          >
            <div>
              개인정보 보호법에 관한 법률에 의거하여 개인정보를 수집, 이용함에
              있어 동의를 받습니다.
            </div>
            <div style={{ paddingTop: "5px" }}>
              귀하는 개인정보 제공동의를 거부할 권리가 있습니다.
            </div>
            <div style={{ paddingTop: "5px"}}>
              단, 동의를 거부하실 경우 진료 안내 서비스를 받을 수 없거나 지연될
              수 있음을 알려드립니다.
            </div>
            <h2 style={{ paddingTop: "25px", paddingBottom: "5px", fontWeight: "bold", fontSize: "25px" }}>수집하는 기본 개인정보항목</h2>
            <div style={{ paddingLeft: "15px" }}>
              <div style={{ display: "flex" }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>이름, 핸드폰 번호 등</div>
              </div>
            </div>
            <h2 style={{ paddingTop: "25px", paddingBottom: "5px", fontWeight: "bold", fontSize: "25px" }}>개인 정보 수집 및 이용목적</h2>
            <div style={{ paddingLeft: "15px" }}>
              <div style={{ display: "flex" }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>환자의 구분 및 관리를 위한 고유 식별 정도</div>
              </div>
              <div style={{ display: "flex" }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>진료 및 예약 등 서비스 이용안내</div>
              </div>
              <div style={{ display: "flex" }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>진료소식 및 안내사항 전달</div>
              </div>
              <div style={{ display: "flex" }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>본원의 발생하는 소식 및 의료정보 제공</div>
              </div>
              <div style={{ display: "flex" }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>환자 맞춤 최적의 서비스 제공 안내</div>
              </div>
              <div style={{ display: "flex" }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>치료 전, 치료 후 비교사진 제공</div>
              </div>
            </div>
            <h2 style={{ paddingTop: "25px", paddingBottom: "5px", fontWeight: "bold", fontSize: "25px" }}>개인정보의 보유, 이용기간</h2>
            <div style={{ paddingLeft: "15px" }}>
              <div style={{ display: "flex" }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>진료 및 치료를 위한 목적으로 의료법에 준하여 법정기간(5년) 보관함.</div>
              </div>
              <div style={{ display: "flex" }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>정보 제공자가 개인정보 삭제를 요청할 경우 즉시 삭제함.</div>
              </div>
              <div style={{ display: "flex" }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>단, 법령의 규정에 의해 보유하도록 한 기간 동안은 보유할 수 있음.</div>
              </div>
              <div style={{ paddingLeft: "17px", marginTop: "5px" }}>
                <div>
                  소비자의 불만 또는 분쟁처리에 관한 기록 : 3년(전자상거래
                  소비자보호에 관한 법률)
                </div>
                <div>
                  신용정보의 수집/처리 및 이용 등에 관한 기록 : 3년(신용정보의 이용
                  및 보호에 관한 법률)
                </div>
                <div>
                  본인 확인에 관한 기록 : 6개월(정보통신망 이용촉진 및 정보보호 등에
                  관한 법률)
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              paddingTop: "30px",
              fontWeight: 400,
              paddingLeft: "30px",
            }}
          >
            {/* 만 14세 미만 아동의 경우 반드시 법정대리인의 동의가 필요함.
          </div>
          <div style={{ paddingLeft: "400px" }}>
            법정 대리인 연락처: {"  "}
            <input
              style={{ width: "150px" }}
              type="text"
              placeholder=""
              value={num}
              onChange={(event) => handleInputChange(event, setNum)}
              onKeyDown={(event) => handleInputKeyDown(event, setNum)}
            />
          </div>
          <div style={{ paddingLeft: "400px" }}>
            법정 대리인과의 관계: {"  "}
            <input
              style={{ width: "150px" }}
              type="text"
              placeholder=""
              value={relation}
              onChange={(event) => handleInputChange(event, setRelation)}
              onKeyDown={(event) => handleInputKeyDown(event, setRelation)}
            />
          </div>
          <div style={{ paddingLeft: "400px" }}>
            법정 대리인: {"  "}
            <input
              style={{ width: "150px" }}
              type="text"
              placeholder=""
              value={agent}
              onChange={(event) => handleInputChange(event, setAgent)}
              onKeyDown={(event) => handleInputKeyDown(event, setAgent)}
            />
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "bold",
              paddingTop: "30px",
            }}
          >
            상기 내용을 상세히 읽어 보았으며 상기 본인은 위와 같이 개인정보 수입
            및 활용에 동의함.
          </div>
          <div
            style={{
              paddingTop: "30px",
              paddingRight: "30px",
              textAlign: "right",
            }}
          >
            20{" "}
            <input
              style={{ width: "30px" }}
              type="text"
              placeholder=""
              value={year}
              onChange={(event) => handleInputChange(event, setYear)}
              onKeyDown={(event) => handleInputKeyDown(event, setYear)}
            />
            년{"  "}
            <input
              style={{ width: "30px" }}
              type="text"
              placeholder=""
              value={month}
              onChange={(event) => handleInputChange(event, setMonth)}
              onKeyDown={(event) => handleInputKeyDown(event, setMonth)}
            />
            월{"  "}
            <input
              style={{ width: "30px" }}
              type="text"
              placeholder=""
              value={day}
              onChange={(event) => handleInputChange(event, setDay)}
              onKeyDown={(event) => handleInputKeyDown(event, setDay)}
            />
            일<div style={{ paddingTop: "30px" }}>신청인: 서명 불러오기</div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformation;
