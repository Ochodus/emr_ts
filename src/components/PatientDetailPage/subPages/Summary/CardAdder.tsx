import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles';
import 'react-date-range-ts/dist/theme/default.css';
import 'reactjs-popup/dist/index.css';
import { AddCircleSharp, KeyboardArrowDown } from "@mui/icons-material";
import { Box, Button, List, ListItem, ListItemButton, ListItemContent, Sheet, Tooltip, Typography, listItemButtonClasses } from "@mui/joy";


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

const CardAdder = ({ isVertical, addContainerFunction, index }: { isVertical: boolean, addContainerFunction: (type: string, path: string[], name: string, index?: number) => any, index: number }) => {
  const [isFixed, setIsFixed] = useState(false)

  const addCard = (type: string, path: string[], name: string) => {
    addContainerFunction(type, path, name, index)
    setFix()
  }

  const setFix = () => {
    setIsFixed(!isFixed)
  }

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
                      <ListItem nested>
                          <Toggler
                                  renderToggle={({ open, setOpen }) => (
                                      <ListItemButton onClick={() => setOpen(!open)}>
                                      <ListItemContent>
                                          <Typography level="title-sm">신체 정보</Typography>
                                      </ListItemContent>
                                      <KeyboardArrowDown
                                          sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
                                      />
                                      </ListItemButton>
                                  )}
                              >
                              <List sx={{ gap: 0.5 }}>
                                  <ListItem sx={{ mt: 0.5 }}>
                                      <ListItemButton onClick={() => {addCard("Physical Exam", ['height'], "키")}}>키</ListItemButton>
                                  </ListItem>
                                  <ListItem>
                                      <ListItemButton onClick={() => {addCard("Physical Exam", ['weight'], "몸무게")}}>몸무게</ListItemButton>
                                  </ListItem>
                                  <ListItem>
                                      <ListItemButton onClick={() => {addCard("Physical Exam", ['diastolic_blood_pressure'], "최저 혈압")}}>혈압</ListItemButton>
                                  </ListItem>
                              </List>
                          </Toggler>
                      </ListItem>
                      <ListItem nested>
                          <Toggler
                              renderToggle={({ open, setOpen }) => (
                                  <ListItemButton onClick={() => setOpen(!open)}>
                                  <ListItemContent>
                                      <Typography level="title-sm">IMOOVE</Typography>
                                  </ListItemContent>
                                  <KeyboardArrowDown
                                      sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
                                  />
                                  </ListItemButton>
                              )}
                          >
                              <List sx={{ gap: 0.5 }}>
                                  <ListItem sx={{ mt: 0.5 }}>
                                      <ListItemButton onClick={() => {addCard("IMOOVE", ['content', 'strength'], "강도")}}>강도</ListItemButton>
                                  </ListItem>
                                  <ListItem>
                                      <ListItemButton onClick={() => {addCard("IMOOVE", ['content', 'sensitivity'], "민감도")}}>민감도</ListItemButton>
                                  </ListItem>
                                  <ListItem>
                                      <ListItemButton onClick={() => {addCard("IMOOVE", ['content', 'supports', 'stability'], "Support Stability")}}>Support Stability</ListItemButton>
                                  </ListItem>
                              </List>
                          </Toggler>
                      </ListItem>
                      <ListItem nested>
                          <Toggler
                                  renderToggle={({ open, setOpen }) => (
                                      <ListItemButton onClick={() => setOpen(!open)}>
                                      <ListItemContent>
                                          <Typography level="title-sm">InBody</Typography>
                                      </ListItemContent>
                                      <KeyboardArrowDown
                                          sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
                                      />
                                      </ListItemButton>
                                  )}
                              >
                              <List sx={{ gap: 0.5 }}>
                                  <ListItem sx={{ mt: 0.5 }}>
                                    <ListItemButton onClick={() => {addCard("InBody", ['content', 'skeletal_muscles_fat', 'body_fat_mass'], "체지방")}}>체지방</ListItemButton>
                                  </ListItem>
                                  <ListItem>
                                    <ListItemButton onClick={() => {addCard("InBody", ['content', 'muscle_mass'], "근육량")}}>근육량</ListItemButton>
                                  </ListItem>
                                  <ListItem>
                                    <ListItemButton onClick={() => {addCard("InBody", ['content', 'lean_body_mass'], "제지방량")}}>제지방량</ListItemButton>
                                  </ListItem>
                                  <ListItem>
                                    <ListItemButton onClick={() => {addCard("InBody", ['content', 'skeletal_muscles_fat', 'skeletal_muscles_mass'], "골격근량")}}>골격근량</ListItemButton>
                                  </ListItem>
                                  <ListItem>
                                    <ListItemButton onClick={() => {addCard("InBody", ['content', 'obesity_detail', 'fat_percentage'], "체지방률")}}>체지방률</ListItemButton>
                                  </ListItem>
                              </List>
                          </Toggler>
                      </ListItem>
                      <ListItem nested>
                        <ListItemButton onClick={() => {addCard("Lookin' Body", ['content', 'inspections'], "Lookin' Body")}}>Lookin' Body</ListItemButton>
                      </ListItem>
                      <ListItem nested>
                          <Toggler
                                  renderToggle={({ open, setOpen }) => (
                                      <ListItemButton onClick={() => setOpen(!open)}>
                                      <ListItemContent>
                                          <Typography level="title-sm">운동능력 검사</Typography>
                                      </ListItemContent>
                                      <KeyboardArrowDown
                                          sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
                                      />
                                      </ListItemButton>
                                  )}
                              >
                              <List sx={{ gap: 0.5 }}>
                                  <ListItem sx={{ mt: 0.5 }}>
                                    <ListItemButton onClick={() => {}}>체지방</ListItemButton>
                                  </ListItem>
                              </List>
                          </Toggler>
                      </ListItem>
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
