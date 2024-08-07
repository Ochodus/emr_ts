const ExerciseGuide = () => {
  return (
    <div className="detail-structure">
      <div
        style={{
          paddingTop: "20px",
          paddingLeft: "40px",
          paddingRight: "40px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            height: "750px",
            padding: "25px",
          }}
        >
          <div
            style={{
              border: "2px solid black",
              textAlign: "left",
              fontSize: "20px",
              fontWeight: 500,
              padding: "30px",
            }}
          >
            <div>
              <div style={{ display: "flex", padding: "5px 0" }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>
                  치료당일 및 무단 예약 취소가 반복 되시면 치료 대기자가 많은 관계로
                  치료 중단 후 대기자로 변경됩니다. (치료 하루 전 센터연락처(010-8328-1831)로 연락 시 제외) 단, 토요일 예약자분들의 경우 토요일 원하시는 대기자분들이 많은
                  관계로 일주일 전에 담당치료사와 예약시간 변경 확인 부탁드립니다.
                </div>
              </div>
              <div style={{ display: "flex", padding: "5px 0"  }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>
                  치료 당일 내원 시 꼭 데스크 접수 후 와주시길 바랍니다.
                </div>
              </div>
              <div style={{ display: "flex", padding: "5px 0"  }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>
                  치료당일 및 무단 예약 취소가 반복 되시면 치료 대기자가 많은 관계로
                  치료 중단 후 대기자로 변경됩니다.
                </div>
              </div>
              <div style={{ display: "flex", padding: "5px 0"  }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>
                  치료시간 전에 내원하셔서, 치료복으로 환복 후 대기실에서 기다려
                  주시기 바랍니다.
                </div>
              </div>
              <div style={{ display: "flex", padding: "5px 0"  }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>
                  롤핑 세션의 경우 1주에 1회로 받으시는 것이 최적의 기간입니다.
                </div>
              </div>
              <div style={{ display: "flex", padding: "5px 0"  }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>
                  롤핑 세션의 경우 1주에 1회로 받으시는 것이 최적의 기간입니다. (단, 치료사와 상담 후 1주 2회 또는 2주에 1회도 가능합니다.)
                </div>
              </div>
              <div style={{ display: "flex", padding: "5px 0"  }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>
                  치료 10회 마다 평가가 진행되며, 전 후 비교 결과 원장님과 상담을
                  진행합니다.
                </div>
              </div>
              <div style={{ display: "flex", padding: "5px 0"  }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>
                  치료 예약 시 요일 및 시간이 고정 예약됩니다. (예 : 월요일 오후 15시 OOO 고정 예약. 치료사와 상담 후 변경 가능.)
                </div>
              </div>
              <div style={{ display: "flex", padding: "5px 0"  }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>
                  예약 변경 및 문의사항 관련 내용은 운동치료센터(010-8328-1831)로
                  전화 및 문자, 카톡 주시길 바랍니다.
                </div>
              </div>
              <div style={{ display: "flex", padding: "5px 0"  }}>
                <div style={{ fontSize: "10px", margin: 'auto 0'}}>⬤</div>
                <div style={{ textAlign: "left", paddingLeft: '10px' }}>
                  치료사 선생님께서 치료 중이실 경우 빠른 답장이 어려울 수 있어,
                  급한 변동 사항이 아니실 경우 답장이 늦을 수 있는 점 양해
                  부탁드립니다.
                </div>
              </div>
            </div>
            {/* <div style={{ paddingTop: "5px" }}>담당선생님:</div> */}
          </div>
          {/* <div style={{ paddingTop: "30px", textAlign: "center" }}>
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
            일
            <div
              style={{
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "bold",
                paddingTop: "30px",
              }}
            >
              위 내용을 인지하고 서명합니다.
            </div>
            <div style={{ paddingTop: "30px" }}>신청인:</div> 
          </div>*/}
        </div>
      </div>
    </div>
  );
};

export default ExerciseGuide;
