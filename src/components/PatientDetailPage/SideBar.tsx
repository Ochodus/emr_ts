import { useState } from 'react'
const { Sidebar, Menu, SubMenu, MenuItem, menuClasses } = require('react-pro-sidebar');

const SideBar = ({ func }: { func: (s: string) => any}) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Sidebar 
            collapsed={collapsed}
            backgroundColor="#212529"
            style={{
                minHeight: "100vh",
            }}
            width="250px"
        >
            <div 
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    color: "white",
                    textAlign: "center",
                    borderBottom: "1px solid #343a40",
                    padding: "5px"
                }}
            >{collapsed ? "확장" : "접기"}</div>
            <Menu
                menuItemStyles={{
                    button: ({ level }: { level: number }) => {
                        // only apply styles on first level elements of the tree
                        if (level === 0)
                          return {
                            color: '#e2e2e2',
                            backgroundColor: "#212529",
                            '&:hover': {
                                backgroundColor: "#023162",
                            },
                            fontSize: "14px"
                          };
                      }
                }}
                rootStyles={{
                    ['.' + menuClasses.subMenuContent]: {
                        backgroundColor: '#343a40',
                        color: '#ffffff',
                        fontSize: "12px",
                    },
                    ['.' + menuClasses.button]: {
                        '&:hover': {
                            backgroundColor: "#adb5bd", 
                            color: '#343a40',
                        }
                    },
                    ['.' + menuClasses.subMenuRoot]: {
                        padding: "10px 0px",
                    }
                    
                }}
            >
                <SubMenu label="환자 정보" defaultOpen={true}>
                    <MenuItem 
                     onClick={() => func("summary")}> 환자 요약 및 통계 </MenuItem>
                    <MenuItem onClick={() => func("readingData")}> 자료 열람 </MenuItem>
                </SubMenu>
                <SubMenu label="진료 및 검사내역 편집" defaultOpen={true}>
                    <MenuItem onClick={() => func("medicalRecord")}> 진료 내역 </MenuItem>
                    <MenuItem onClick={() => func("testSelect")}> 검사 내역 </MenuItem>
                    <MenuItem onClick={() => func("reportHistory")}> 레포트 내역 </MenuItem>
                    <MenuItem onClick={() => func("exerciseDetail")}> 운동치료 내역 </MenuItem>
                </SubMenu>
                <SubMenu label="기타자료" defaultOpen={true}>
                    <MenuItem onClick={() => func("personalInformation")}> 개인정보 제공 및 활용 동의서 </MenuItem>
                    <MenuItem onClick={() => func("exerciseGuide")}> 운동치료 안내서 </MenuItem>
                </SubMenu>
            </Menu>
        </Sidebar>
    )
}

export default SideBar