import { useDispatch } from "react-redux";
import { History } from ".";
import { Sheet,Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useEffect, useState } from "react";
import { changeInspection } from "reducers/inspection"

const cardTypes = ["IMOOVE", "X-Ray", "InBody", "Exbody", "Lookin' Body", "혈액 검사 결과", "설문지", "족저경", "운동능력 검사", "정렬 사진", "평지 보행 동영상"]

const TestSelection = () => {
  const dispatch = useDispatch()

  const [inspectionSelection, setInspectionSelection] = useState("IMOOVE")

  const handleInspectionChange = (inspection: string) => {
    dispatch(changeInspection({currentInspection: inspection}))
    setInspectionSelection(inspection)
  }

  useEffect(() => {
    let initialInspection = window.localStorage.getItem("persist:inspection")
    setInspectionSelection(initialInspection ? JSON.parse(JSON.parse(initialInspection).currentInspection) : null)
  }, [])

  return (
    <Sheet sx={{ flex: '1 0 auto' }}>
        <Tabs 
          aria-label="Scrollable tabs" 
          value={cardTypes.indexOf(inspectionSelection)} 
          onChange={(_, value) => {if (value !== null) handleInspectionChange(typeof value === 'number' ? cardTypes[value] : value)}} 
          defaultValue={0} 
          sx={{ height: '100%', width: '100%' }}
        >
          <TabList
            sx={{
              width: '100%',
              overflow: 'auto',
              scrollSnapType: 'x mandatory',
              '&::-webkit-scrollbar': { display: 'none' },
              flex: '0 0 auto'
            }}
          >
            {cardTypes.map((type, index) => (
              <Tab key={index} sx={{ flex: 'none', scrollSnapAlign: 'start' }}>
                {type}
              </Tab>
            ))}
          </TabList>
          {cardTypes.map((type, index) => (
            <TabPanel value={index} key={index} sx={{ background: '#ffffff', flex: '1 0 auto' }}>
              <History type={type}/>
            </TabPanel>
          ))}
        </Tabs>
    </Sheet>
  );
};

export default TestSelection;
