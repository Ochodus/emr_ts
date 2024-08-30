import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles';
import 'react-date-range-ts/dist/theme/default.css';
import 'reactjs-popup/dist/index.css';
import { AddCircleSharp, KeyboardArrowDown } from "@mui/icons-material";
import { Box, Button, Divider, List, ListItem, ListItemButton, ListItemContent, Sheet, Tooltip, Typography, listItemButtonClasses } from "@mui/joy";
import { Update } from "../ReportHistory/ReportHistoryAddModal";
import { ID } from "components/commons/TableMui";

interface CardAdderProps {
  isVertical: boolean, 
  addContainerFunction: (type: string, path: string[], name: string, index?: number, start?: string, end?: string) => any, 
  index: number,
  externalAdderList?: (Update & ID)[]
}

function Toggler({
  defaultExpanded = false,
  renderToggle,
  children,
}: {
  defaultExpanded?: boolean;
  children: React.ReactNode;
  renderToggle: (params: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultExpanded);
  return (
    <React.Fragment>
      {renderToggle({ open, setOpen })}
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: '0.2s ease',
          '& > *': {
            overflow: 'hidden',
          },
        }}
      >
        {children}
      </Box>
    </React.Fragment>
  );
}

const CardAdder = ({ 
  isVertical, 
  addContainerFunction, 
  index,
  externalAdderList
}: CardAdderProps) => {
  const [isFixed, setIsFixed] = useState(false)
  const addList = [
    {catTitle: "기본 검사", category: "Physical Exam", content: [
      {path: ['height'], title: "키", label: "키"},
      {path: ['weight'], title: "몸무게", label: "몸무게"},
      {path: ['diastolic_blood_pressure'], title: "최저혈압", label: "최저혈압"},
      {path: ['systolic_blood_pressure'], title: "최고혈압", label: "최고혈압"},
      {path: ['body_temperature'], title: "체온", label: "체온"}
    ]},
    {catTitle: "IMOOVE", category: "IMOOVE", content: [
      {path: ['content', '0', 'strength'], title: "강도", label: "강도"},
      {path: ['content', '0', 'sensitivity'], title: "민감도", label: "민감도"},
      {path: ['content', '0', 'time'], title: "소요시간", label: "소요시간"},
      {path: ['content', '0', 'supports', 'stability'], title: "Support Stability", label: "Support Stability"},
      {path: ['content', '0', 'supports', 'distribution', 'points'], title: "Support Points", label: "Support Points"},
      {path: ['content', '0', 'trunk', 'stability'], title: "Trunk Stability", label: "Trunk Stability"},
      {path: ['content', '0', 'trunk', 'distribution', 'points'], title: "Trunk Points", label: "Trunk Points"},
      {path: ['content', '0', 'postural_coordination', 'point'], title: "Postural Coordination", label: "Postural Coordination"},
      {path: ['content', '0', 'postural_strategy'], title: "Postural Strategy", label: "Postural Strategy"},
    ]},
    {catTitle: "InBody", category: "InBody", content: [
      {path: ['content', 'body_water_composition', 'body_water', 'value'], title: "체수분", label: "체수분"},
      {path: ['content', 'body_water_composition', 'intracellular', 'value'], title: "세포내수분", label: "세포내수분"},
      {path: ['content', 'body_water_composition', 'extracellular', 'value'], title: "세포외수분", label: "세포외수분"},
      {path: ['content', 'body_water_composition', 'extracellular_hydration_percentage'], title: "세포외수분비", label: "세포외수분비"},
      {path: ['content', 'segmental_body_water_analysis', 'right_arm', 'value'], title: "체수분(오른팔)", label: "체수분(오른팔)"},
      {path: ['content', 'segmental_body_water_analysis', 'left_arm', 'value'], title: "체수분(왼팔)", label: "체수분(왼팔)"},
      {path: ['content', 'segmental_body_water_analysis', 'body', 'value'], title: "체수분(몸통)", label: "체수분(몸통)"},
      {path: ['content', 'segmental_body_water_analysis', 'right_leg', 'value'], title: "체수분(오른다리)", label: "체수분(오른다리)"},
      {path: ['content', 'segmental_body_water_analysis', 'left_leg', 'value'], title: "체수분(왼다리)", label: "체수분(왼다리)"},
      {path: ['content', 'segmental_lean_analysis', 'right_arm'], title: "근육량(오른팔)", label: "근육량(오른팔)"},
      {path: ['content', 'segmental_lean_analysis', 'left_arm'], title: "근육량(왼팔)", label: "근육량(왼팔)"},
      {path: ['content', 'segmental_lean_analysis', 'body'], title: "근육량(몸통)", label: "근육량(몸통)"},
      {path: ['content', 'segmental_lean_analysis', 'right_leg'], title: "근육량(오른다리)", label: "근육량(오른다리)"},
      {path: ['content', 'segmental_lean_analysis', 'left_leg'], title: "근육량(왼다리)", label: "근육량(왼다리)"},
      {path: ['content', 'body_composition_analysis', 'protein', 'value'], title: "단백질", label: "단백질"},
      {path: ['content', 'body_composition_analysis', 'minerals', 'value'], title: "무기질", label: "무기질"},
      {path: ['content', 'body_composition_analysis', 'body_fat_mass', 'value'], title: "체지방", label: "체지방"},
      {path: ['content', 'body_composition_analysis', 'lean_body_mass', 'value'], title: "제지방량", label: "제지방량"},
      {path: ['content', 'body_composition_analysis', 'osseous_mineral', 'value'], title: "골무기질량", label: "골무기질량"},
      {path: ['content', 'muscle_fat_analysis', 'skeletal_muscles_mass', 'value'], title: "골격근량", label: "골격근량"},
      {path: ['content', 'muscle_fat_analysis', 'muscle_mass', 'value'], title: "근육량", label: "근육량"},
      {path: ['content', 'obesity_detail', 'BMI', 'value'], title: "BMI", label: "BMI"},
      {path: ['content', 'obesity_detail', 'fat_percentage', 'value'], title: "체지방률", label: "체지방률"},
      {path: ['content', 'research_parameter', 'basal_metabolic_rate', 'value'], title: "기초대사량", label: "기초대사량"},
      {path: ['content', 'research_parameter', 'visceral_fat_area'], title: "내장지방단면적", label: "내장지방단면적"},
      {path: ['content', 'research_parameter', 'waist_hip_ratio', 'value'], title: "복부지방률", label: "복부지방률"},
      {path: ['content', 'research_parameter', 'body_cell_mass', 'value'], title: "체세포량", label: "체세포량"},
      {path: ['content', 'research_parameter', 'upper_arm_circumference'], title: "상완위팔둘레", label: "상완위팔둘레"},
      {path: ['content', 'research_parameter', 'upper_arm_muscle_circumference'], title: "상완위팔근육둘레", label: "상완위팔근육둘레"},
      {path: ['content', 'research_parameter', 'tbw_ffm'], title: "TBW/FFM", label: "TBW/FFM"},
      {path: ['content', 'research_parameter', 'smi'], title: "SMI", label: "SMI"},
    ]},
    {catTitle: "Exbody", category: "Exbody", content: [
      {path: ['content', 'fhp', 'rear'], title: "FHP(뒤)", label: "FHP(뒤)"},
      {path: ['content', 'fhp', 'front'], title: "FHP(앞)", label: "FHP(앞)"},
      {path: ['content', 'trunk_lean', 'rear'], title: "Trunk Lean(뒤)", label: "Trunk Lean(뒤)"},
      {path: ['content', 'trunk_lean', 'front'], title: "Trunk Lean(앞)", label: "Trunk Lean(앞)"},
      {path: ['content', 'hip_extension_and_flexion', 'right', 'front'], title: "Hip Extension/Flexion(오른쪽 앞)", label: "Hip Extension/Flexion(오른쪽 앞)"},
      {path: ['content', 'hip_extension_and_flexion', 'right', 'rear'], title: "Hip Extension/Flexion(오른쪽 뒤)", label: "Hip Extension/Flexion(오른쪽 뒤)"},
      {path: ['content', 'hip_extension_and_flexion', 'left', 'front'], title: "Hip Extension/Flexion(왼쪽 앞)", label: "Hip Extension/Flexion(왼쪽 앞)"},
      {path: ['content', 'hip_extension_and_flexion', 'left', 'rear'], title: "Hip Extension/Flexion(왼쪽 뒤)", label: "Hip Extension/Flexion(왼쪽 뒤)"},
      {path: ['content', 'hip_rotation', 'left', 'inside'], title: "Hip Rotation(왼쪽 내)", label: "Hip Rotation(왼쪽 내)"},
      {path: ['content', 'hip_rotation', 'left', 'outside'], title: "Hip Rotation(왼쪽 외)", label: "Hip Rotation(왼쪽 외)"},
      {path: ['content', 'hip_rotation', 'right', 'inside'], title: "Hip Rotation(오른쪽 내)", label: "Hip Rotation(오른쪽 내)"},
      {path: ['content', 'hip_rotation', 'right', 'outside'], title: "Hip Rotation(오른쪽 외)", label: "Hip Rotation(오른쪽 외)"},
      {path: ['content', 'knee_extension_and_flexion', 'left'], title: "Knee Extension/Flexion(왼쪽)", label: "Knee Extension/Flexion(왼쪽)"},
      {path: ['content', 'knee_extension_and_flexion', 'right'], title: "Knee Extension/Flexion(오른쪽)", label: "Knee Extension/Flexion(오른쪽)"},
      {path: ['content', 'trunk_side_lean', 'right'], title: "Trunk Side Lean(오른쪽)", label: "Trunk Side Lean(오른쪽)"},
      {path: ['content', 'trunk_side_lean', 'left'], title: "Trunk Side Lean(왼쪽)", label: "Trunk Side Lean(왼쪽)"},
      {path: ['content', 'horizontal_movement_of_cog', 'left'], title: "Horizontal Movement of COG(왼쪽)", label: "Horizontal Movement of COG(왼쪽)"},
      {path: ['content', 'vertical_movement_of_cog', 'up'], title: "Vertical Movement of COG(위)", label: "Vertical Movement of COG(위)"},
      {path: ['content', 'pelvic_rotation', 'right'], title: "Pelvic Rotation(오른쪽)", label: "Pelvic Rotation(오른쪽)"},
      {path: ['content', 'pelvic_rotation', 'left'], title: "Pelvic Rotation(왼쪽)", label: "Pelvic Rotation(왼쪽)"},
      {path: ['content', 'step_width', 'value'], title: "Step Width", label: "Step Width"},
      {path: ['content', 'stride', 'value'], title: "Stride", label: "Stride"},
    ]},
    {catTitle: "Lookin' Body", category: "Lookin' Body", content: [
      {path: ['content', '눈감고 외발서기 (초)', 'value'], title: "눈감고 외발서기 (초)", label: "눈감고 외발서기 (초)"},
      {path: ['content', '전신반응 (초)', 'value'], title: "전신반응 (초)", label: "전신반응 (초)"},
      {path: ['content', '제자리 높이뛰기 (cm)', 'value'], title: "제자리 높이뛰기 (cm)", label: "제자리 높이뛰기 (cm)"}
    ]},
    {catTitle: "Physical Performance", category: "Physical Performance", content: [
      {path: ['content', 'functional_line', '0', 'lt', 'lt', 'lt', '0'], title: "Functional Line", label: "Functional Line"},
      {path: ['content', 'y_balance', '0', 'at', 'pt', '0'], title: "Y Balance", label: "Y Balance"},
    ]},
  ]

  const [externalAddList, setExternalAddList] = useState<{
    catTitle: string;
    category: string;
    content: {
        path: string[];
        title: string;
        label: string;
        start?: string;
        end?: string;
    }[]
  }[]>([])

  const addCard = (type: string, path: string[], name: string, start?: string, end?: string) => {
    addContainerFunction(type, path, name, index, start, end)
    setFix()
  }

  const setFix = () => {
    setIsFixed(!isFixed)
  }

  useEffect(() => {
    if (externalAdderList) {
      let parsed = externalAdderList.reduce((acc, value) => {

        const existingCat = acc.find(item => item.catTitle === value.name)

        if (existingCat) {
          existingCat.content.push({
            path: value.adderPath ?? [], 
            title: value.adderTitle ?? "", 
            label: value.adderLabel ?? "",
            start: value.start_date,
            end: value.end_date
          })
        } else {
          acc.push({
            catTitle: value.name, 
            category: value.adderCategory ?? "", 
            content: [{
              path: value.adderPath ?? [], 
              title: value.adderTitle ?? "", 
              label: value.adderLabel ?? "",
              start: value.start_date,
              end: value.end_date
            }],            
          })
        }

        return acc
      }, [] as ({catTitle: string, category: string, content: {path: string[], title: string, label: string, start?: string, end?: string}[]})[])

      setExternalAddList(parsed)
    }
  }, [externalAdderList])

  return (
    <Sheet
      sx={{
        height: isVertical ? '100%' : '30px',
        width: isVertical ? '30px' : '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'inherit',
        '&:hover': {
          '&>.MuiButton-root': {
            opacity: 1
          }
        }
      }}
      variant="plain"
    >
      <Tooltip
        placement="right"
        title={
          <Sheet
            className="Sidebar"
            sx={{
                p: 0.5,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                minHeight: 0,
                overflow: 'hidden auto',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                [`& .${listItemButtonClasses.root}`]: {
                    gap: 1.5,
                },
              }}
            >
              <List
                size="sm"
                sx={{
                    gap: 1,
                    '--List-nestedInsetStart': '30px',
                    '--ListItem-radius': (theme) => theme.vars.radius.sm,
                }}
              >
                {addList.map((adder, index) => {
                  return (
                    <ListItem nested key={index}>
                      <Toggler
                        renderToggle={({ open, setOpen }) => (
                          <ListItemButton onClick={() => setOpen(!open)}>
                            <ListItemContent>
                              <Typography level="title-sm">{adder.catTitle}</Typography>
                            </ListItemContent>
                            <KeyboardArrowDown
                              sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
                            />
                          </ListItemButton>
                        )}
                      >
                        <List sx={{ gap: 0.5 }}>
                          {adder.content.map((value, index) => {
                            return (
                              <ListItem sx={{ mt: 0.5 }} key={index}>
                                <ListItemButton onClick={() => {addCard(adder.category, value.path, value.title)}}>{value.label}</ListItemButton>
                              </ListItem>
                            )
                          })}
                        </List>
                      </Toggler>
                    </ListItem>
                  )
                })}
                {externalAddList.length > 0 && <Divider />}
                {externalAddList.map((adder, index) => {
                  return (
                    <ListItem nested key={index}>
                      <Toggler
                        renderToggle={({ open, setOpen }) => (
                          <ListItemButton onClick={() => setOpen(!open)}>
                            <ListItemContent>
                              <Typography level="title-sm">{adder.catTitle}</Typography>
                            </ListItemContent>
                            <KeyboardArrowDown
                              sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
                            />
                          </ListItemButton>
                        )}
                      >
                        <List sx={{ gap: 0.5 }}>
                          {adder.content.map((value, index) => {
                            return (
                              <ListItem sx={{ mt: 0.5 }} key={index}>
                                <ListItemButton onClick={() => {addCard(adder.category, value.path, value.title, value.start, value.end)}}>{value.label}</ListItemButton>
                              </ListItem>
                            )
                          })}
                        </List>
                      </Toggler>
                    </ListItem>
                  )
                })}             
              </List>
            </Box>
          </Sheet>
        }
        arrow
        variant="outlined"
        open={isFixed}
      >
        <Button 
          variant="plain"
          sx={{
            margin: 'auto',
            opacity: isFixed ? 1 : 0,
            transition: 'opacity 0.2s',
            '&:hover': {
              backgroundColor: 'inherit'
            }
          }}
          onClick={setFix}
          
        >
          <AddCircleSharp htmlColor='#757de8'/>
        </Button>
      </Tooltip>
    </Sheet>
  );
};

export default CardAdder;
