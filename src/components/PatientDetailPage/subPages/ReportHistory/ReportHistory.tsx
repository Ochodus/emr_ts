import React, { useState, useEffect } from "react";
import Table from "../../../commons/Table";

export interface Report {
	symptoms: string[],
	diagnostics: string[],
	memo: string,
	recorded: string,
	height: number,
	weight: number,
	systolic_blood_pressure: number,
	diastolic_blood_pressure: number
} // ReportHistory 객체 타입

const headers = [
  {
    text: "리포트 기간",
    value: "date",
  },
  {
    text: "변화 항목",
    value: "change",
  },
  {
    text: "치료사",
    value: "healer",
  },
  {
    text: "기타의견",
    value: "otheropinions",
  },
  ,
  {
    text: "비고",
    value: "note",
  },
];

const items = [
  {
    date: "1992.01.08~2021.09.23",
    change: "M",
    healer: "188",
    otheropinions: "90",
    note: "125",
  },
  {
    date: "1992.01.08~2011.09.23",
    change: "M",
    healer: "188",
    otheropinions: "90",
    note: "125",
  },
  {
    date: "1999.01.08~2024.09.23",
    change: "M",
    healer: "188",
    otheropinions: "90",
    note: "125",
  },
  {
    date: "1992.01.28~2021.09.13",
    change: "M",
    healer: "188",
    otheropinions: "90",
    note: "125",
  },
  {
    date: "1992.03.08~2021.09.20",
    change: "M",
    healer: "188",
    otheropinions: "90",
    note: "125",
  },
  {
    date: "1992.05.08~2021.09.23",
    change: "M",
    healer: "188",
    otheropinions: "90",
    note: "125",
  },
  {
    date: "1992.01.08~2021.05.23",
    change: "M",
    healer: "188",
    otheropinions: "90",
    note: "125",
  },
];

const ReportHistory = () => {
  const [selection, setSelection] = useState([]);
  useEffect(() => {
    console.log(selection);
  }, [selection]);
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
            height: "600px",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ddd",
              height: "550px",
              padding: "10px",
              paddingTop: "10px",
              borderRadius: "15px",
            }}
          >
            <p
              style={{
                paddingLeft: "30px",
                color: "#3f3f3f",
                fontWeight: "700",
                fontSize: "18px",
              }}
            >
              리포트 내역 편집
            </p>
            <div
              style={{
                paddingTop: "5px",
                paddingLeft: "15px",
              }}
            >
              {/* <Table
                headers={headers}
                items={items}
                selectable={true}
                updateSelection={setSelection}
              /> */}
              <div
                style={{
                  paddingTop: "50px",
                  paddingRight: "15px",
                  textAlign: "right",
                }}
              >
                <div>
                  <img className="edit-img" src="/img/plus.png" alt="plus" />
                  <img className="edit-img" src="/img/edit.png" alt="edit" />
                  <img
                    className="edit-img"
                    src="/img/delete.png"
                    alt="delete"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportHistory;
