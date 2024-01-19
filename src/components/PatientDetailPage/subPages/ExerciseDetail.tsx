import React, { useState, useEffect } from "react";
import { Table } from "../../commons/Table";
const headers = [
  {
    text: "시행 날짜",
    value: "date",
  },
  {
    text: "운동 종류",
    value: "type",
  },
  {
    text: "상세 내역",
    value: "details",
  },
  {
    text: "시행 시간",
    value: "time",
  },
  ,
  {
    text: "시행 횟수",
    value: "num",
  },
];

const items = [
  {
    date: "1992.01.08",
    type: "M",
    details: "188",
    time: "90",
    num: "125",
  },
  {
    date: "1999.01.08",
    type: "M",
    details: "188",
    time: "90",
    num: "125",
  },
  {
    date: "1992.09.08",
    type: "M",
    details: "188",
    time: "90",
    num: "125",
  },
  {
    date: "2001.01.08",
    type: "M",
    details: "188",
    time: "90",
    num: "125",
  },
  {
    date: "2009.01.08",
    type: "M",
    details: "188",
    time: "90",
    num: "125",
  },
  {
    date: "1992.12.08",
    type: "M",
    details: "188",
    time: "90",
    num: "125",
  },
];

const ExerciseDetail = () => {
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
              운동치료 내역 편집
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

export default ExerciseDetail;
