import { WarningRounded } from "@mui/icons-material"
import { Transition } from 'react-transition-group'
import { Button, DialogActions, DialogContent, DialogTitle, Divider, Modal, ModalDialog } from "@mui/joy"
import React from "react"

interface DeleteAlertProps {
    showDeletionAlert: boolean,
    message?: string,
    setShowDeletionAlert: React.Dispatch<React.SetStateAction<boolean>>,
    deleteFunction: () => void
}

const Alert = ({showDeletionAlert, message, setShowDeletionAlert, deleteFunction}: DeleteAlertProps) => {
    const nodeRef = React.useRef(null)

    return (
        <Transition nodeRef={nodeRef} in={showDeletionAlert} timeout={400}>
            {(state: string) => (
                <Modal
                    ref={nodeRef}
                    keepMounted
                    open={!['exited', 'exiting'].includes(state)}
                    onClose={() => setShowDeletionAlert(false)}
                    slotProps={{
                    backdrop: {
                        sx: {
                        opacity: 0,
                        backdropFilter: 'none',
                        transition: `opacity 200ms, backdrop-filter 200ms`,
                        ...{
                            entering: { opacity: 1, backdropFilter: 'blur(8px)' },
                            entered: { opacity: 1, backdropFilter: 'blur(8px)' },
                        }[state],
                        },
                    },
                    }}
                    sx={{
                    visibility: state === 'exited' ? 'hidden' : 'visible',
                    }}
                >
                    <ModalDialog
                        sx={{
                            opacity: 0,
                            transition: `opacity 150ms`,
                            ...{
                            entering: { opacity: 1 },
                            entered: { opacity: 1 },
                            }[state],
                        }}
                        role="alertdialog"
                    >
                        <DialogTitle>
                            <WarningRounded color="error"/>
                            Confirmation
                        </DialogTitle>
                        <Divider />
                        <DialogContent>
                            {message ?? '정말 선택된 항목들을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.'}
                        </DialogContent>
                        <DialogActions>
                            <Button variant="solid" color="danger" onClick={deleteFunction}>
                                확인
                            </Button>
                            <Button variant="plain" color="neutral" onClick={() => setShowDeletionAlert(false)}>
                                취소
                            </Button>
                        </DialogActions>
                    </ModalDialog>
                </Modal>
            )}
        </Transition>
    )
}

export default Alert