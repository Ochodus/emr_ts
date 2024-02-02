import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

interface SurveyTypeSelectModalProps {
    show: boolean;
    handleShowAdult: () => void;
    handleShowChild: () => void;
    handleClose: () => void;
}

const SurveyTypeSelectModal: React.FC<SurveyTypeSelectModalProps> = ({ show, handleShowAdult, handleShowChild, handleClose }) => {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>설문지 유형 선택</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Button className="mr-3" onClick={handleShowAdult}>성인용</Button>
                <Button onClick={handleShowChild}>아동용</Button>
            </Modal.Body>
        </Modal>
    );
};

export default SurveyTypeSelectModal;
