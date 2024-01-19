import React, { useState } from "react";

const ReadingData = () => {
  const [selectedData, setSelectedData] = useState("IMOOVE");
  const OPTIONS = [
    { value: "doctor", name: "IMOOVE" },
    { value: "hi", name: "안녕" },
    { value: "hello", name: "반가워" },
  ];
  const SelectBox = (props: any) => {
    return (
      <select
        value={props.selectedValue}
        onChange={(event) => props.setSelectedValue(event.target.value)}
      >
        {props.options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    );
  };
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
            borderRadius: "7px",
          }}
        >
          <div
            className="reading-head"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div
              style={{
                color: "#3f3f3f",
                fontWeight: "800",
                fontSize: "35px",
              }}
            >
              자료 선택
            </div>
            <div style={{ marginLeft: "25px" }}>
              <SelectBox
                style={{ width: "28px", height: "35px" }}
                options={OPTIONS}
                selectedValue={selectedData}
                setSelectedValue={setSelectedData}
              ></SelectBox>
            </div>
            <div
              style={{
                color: "#3f3f3f",
                fontWeight: "800",
                fontSize: "35px",
                marginLeft: "20px",
              }}
            >
              회차 선택
            </div>
            <div style={{ marginLeft: "25px" }}>
              <SelectBox
                style={{ width: "28px", height: "35px" }}
                options={OPTIONS}
                selectedValue={selectedData}
                setSelectedValue={setSelectedData}
              ></SelectBox>
            </div>
          </div>
          <div
            className="reading-body"
            style={{
              paddingTop: "10px",
            }}
          >
            원본 자료
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingData;
