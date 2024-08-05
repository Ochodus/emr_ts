import { useState } from 'react';
import axios from 'axios';
import FormData from 'form-data';
import InputGroup from 'react-bootstrap/InputGroup'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from "react-bootstrap";
import Button from '@mui/material/Button'
// import Modal from '@mui/material';
import Form from 'react-bootstrap/Form';
import { FormCheckType } from 'react-bootstrap/FormCheck';
import styles from './OcrParser.module.css'
import classNames from 'classnames/bind';
import { MuiFileInput } from 'mui-file-input'
import CloseIcon from '@mui/icons-material/Close'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import * as pdfjs from 'pdfjs-dist'
import { BASE_OCR_URL } from 'api/commons/request';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()


interface OcrParserProps {
  children?: React.ReactNode,
  type: number,
  isMask: boolean,
  setOcrResult: (result: any) => void,
  file: File | null,
  setFile: (file: File | null) => void,
  cv: any,
  smallSize: boolean,
  indicator: number,
  label?: string,
  index?: number
}

const OcrParser = ({ type=0, isMask=true, setOcrResult, file, setFile, cv, smallSize=false, indicator=0, label="파일 선택", index=0 }: OcrParserProps) => {
    const [show, setShow] = useState(false) // 미리보기 확대 모달 display 컨트롤
    const [showEditor, setShowEditor] = useState(false) // 마스킹 설정 모달 display 컨트롤
  
    const [modal_img, set_img] = useState("") // 미리보기 확대 모달 표시 항목 컨트롤
    const [isDisabled, setDisabled] = useState(false) // 마스킹 설정 폼 활성화 컨트롤
  
    const [isMasked, set_masking] = useState(isMask) // 마스킹 토글 정보 컨트롤
  
    const [maskTemplate, setMaskTemplate] = useState(type) // 마스킹 템플릿 정보 컨트롤

    const image_width = smallSize ? 130 : 300

    // 미리보기 확대 모달 숨기기, 표시
    const handleClose = () => setShow(false)
    const handleShow = (e: any) => { 
      setShow(true)
      set_img(e.target.id)
    }
  
    // 마스킹 설정 모달 숨기기, 표시
    const handleCloseEditor = () => setShowEditor(false)
    const handleShowEditor = () => {
      setShowEditor(true)
      
    }
  
    // 마스킹 토글링
    const toggleMask = (e: any) => {
      set_masking(e.target.checked)
      copy_original(e.target.checked, `${indicator}`)
    }
  
    // 이미지 확대 복사
    const showImg = () => {
      let img = cv.imread(modal_img)
      cv.imshow(`ocr_mag-${index}-${indicator}`, img)
    }
  
    // 마스킹 템플릿 모달에 이미지 표시
    const showTemplate = () => {
      let img = cv.imread(`ocr_original_masked-${index}-${indicator}`)
      cv.imshow(`ocr_mask_setting-${index}-${indicator}`, img)
      document.getElementById(`template-${index}-${maskTemplate}-${indicator}`)?.click()
    }
  
    // 마스킹 템플릿 변경 시 렌더링 변경
    const changeTemplate = (e: any) => {
      let templateNum = Number(e.target.id.split('-')[1])
      
      if (!isNaN(templateNum)) {
        setMaskTemplate(templateNum)
        masking(templateNum, undefined)
        copy_original(true, `${indicator}`)
        let img = cv.imread(`ocr_original_masked-${index}-${indicator}`)
        cv.imshow(`ocr_mask_setting-${index}-${indicator}`, img)
      }
    }

        // Display selected image by input element
    const renderSelected = async (file: File | null, indicator: string) => {
      setFile(file)
      
      const ocr_original = document.getElementById(`ocr_original-${index}-${indicator}`) as HTMLCanvasElement
      if (!ocr_original) return

      let reader = new FileReader()

      if (!file) {
        let context = ocr_original.getContext('2d', {willReadFrequently: true})
        context!.clearRect(0, 0, ocr_original.width, ocr_original.height)

        document.getElementById(`ocr_images-${index}-${indicator}`)?.setAttribute("style", "display: none;")
        document.getElementById(`setting_bar-${index}-${indicator}`)?.setAttribute("style", "display: none;")
        document.getElementById(`no_selected-${index}-${indicator}`)?.setAttribute("style", "display: none;")
        // Copy from original to input canvas after finished rendering original 
        masking(maskTemplate, indicator)
        copy_output(isMasked, indicator)
        copy_original(isMasked, indicator)

        return 
      }

      try { reader.readAsDataURL(file) }
      catch { return }

      reader.onload = (e: ProgressEvent<FileReader>) => {
        // When file type is pdf
        if (file!['type'].split('/')[1] === 'pdf') {
          let data: string = ""

          if (typeof e?.target?.result === 'string')
            data = atob(e?.target?.result?.replace(/.*base64,/, ""))

          pdfjs.getDocument(data).promise.then(function (pdf: any) {
            pdf.getPage(1).then(function (page: any) {
              const viewport = page.getViewport({ scale: 1444/page.getViewport({ scale: 1.0 }).height })
              ocr_original.height = viewport.height
              ocr_original.width = viewport.width
              const renderContext = {
                canvasContext: ocr_original.getContext('2d', {willReadFrequently: true}),
                viewport: viewport
              }
              
              // Copy from original to input canvas after finished rendering original 
              page.render(renderContext).promise.then(function () {

                document.getElementById(`ocr_images-${index}-${indicator}`)?.setAttribute("style", "display: flex;")
                document.getElementById(`setting_bar-${index}-${indicator}`)?.setAttribute("style", "display: flex;")
                document.getElementById(`no_selected-${index}-${indicator}`)?.setAttribute("style", "display: none;")

                masking(maskTemplate, indicator)
                copy_original(isMasked, indicator)
              })
            })
          })
        }
        // When file type is not pdf (assume image file)
        else {
          let img = new Image()
          let context = ocr_original.getContext('2d', {willReadFrequently: true})
          img.src = `${e.target?.result}`

          img.onload = () => {
            ocr_original.width = img.width
            ocr_original.height = img.height

            context!.drawImage(img, 0, 0)

            document.getElementById(`ocr_images-${index}-${indicator}`)?.setAttribute("style", "display: flex;")
            document.getElementById(`setting_bar-${index}-${indicator}`)?.setAttribute("style", "display: flex;")
            document.getElementById(`no_selected-${index}-${indicator}`)?.setAttribute("style", "display: none;")
            // Copy from original to input canvas after finished rendering original 
            masking(maskTemplate, indicator)
            copy_original(isMasked, indicator)
          }
        }
      }
    }

    const copy_original = (isMasked: boolean, indicator: string) => {
      let img = isMasked ? cv.imread(`ocr_original_masked-${index}-${indicator}`) : cv.imread(`ocr_original-${index}-${indicator}`)
      cv.imshow(`ocr_input-${index}-${indicator}`, img)
    }

    const copy_output = (isMasked: boolean, indicator: string) => {
      let img = isMasked ? cv.imread(`ocr_original_masked-${index}-${indicator}`) : cv.imread(`ocr_original-${index}-${indicator}`)
      cv.imshow(`ocr_output-${index}-${indicator}`, img)
    }

    // Request clova api when click the convert button
    const requestWithFile = (isMasked: boolean, indicator: string) => {
      let target = document.getElementById(`ocr-target-${index}-${indicator}`) as any
      var file_name = target?.files[0]['name'].split('.')[0] // 파일 이름
      var canvas = isMasked ? document.getElementById(`ocr_original_masked-${index}-${indicator}`) as any : document.getElementById(`ocr_original-${index}-${indicator}`) as any

      canvas?.toBlob((blob: string) => { //canvas에 그려진 이미지를 기준으로 파일 객체 생성
        var file = new File([blob], file_name + ".png", {type: "image/png"}) 
        
        const message = {
          images: [
            {
              format: file['name'].split('.')[1], // file format
              name: file['name'].split('.')[0] // file name
            }
          ],
          requestId: 'sdf4124', // 임의의 unique string
          timestamp: 0,
          version: 'V2'
        }
        
        const formData = new FormData()
      
        formData.append('file', file)
        formData.append('message', JSON.stringify(message))
      
        axios //ocr api 호출
          .post(
            `${BASE_OCR_URL}/custom/v1/25705/fbe7d4dadf6a508241cbfea087073df50d1c6ae735b81dd9ff85b327572db2d6/infer`, // BASE_OCR_URL = "https://6n1q18xmim.apigw.ntruss.com" ocr api 주소
            formData,
            {
              headers: {
                'X-OCR-SECRET': '************************', // 네이버 클로바 secret key
                ...formData.getHeaders ? formData.getHeaders() : { 
                  'Content-Type': 'multipart/form-data',
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Credentials': 'true'
                },
              }
            }
          )
          .then(res => {
            if (res.status === 200) {
              console.log('requestWithFile response:', res.data)
              drawBoxes(res.data, isMasked, indicator) // res.data를 프론트로 넘겨주면 됨
            }
          })
          .catch(e => {
            console.warn('requestWithFile error', e)
          })
      })
    }

    function masking(template: number, indicator: string = '1') {
      // inbody체성분,  inbdoy체수분, exbody, lookin' body 순
      const x_min = [62, 65, 5,  65]
      const x_max = [761, 760, 505, 270]

      const y_min = [160, 155, 65, 75]
      const y_max = [282, 260, 100, 115]

      let img = cv.imread(`ocr_original-${index}-${indicator ?? ""}`)

      let topLeft = new cv.Point(x_min[template], y_min[template])
      let bottomRight = new cv.Point(x_max[template], y_max[template])

      cv.rectangle(img, topLeft, bottomRight, [255, 255, 255, 255], -1)
      cv.rectangle(img, topLeft, bottomRight, [210, 210, 230, 255], 1)
      cv.imshow(`ocr_original_masked-${index}-${indicator}`, img)
    }

    // Boxing function with the result of ocr by CLOVA API; Requiring opencv.js
    function drawBoxes(data: any, isMasked: boolean, indicator: string) {
      let img = isMasked ? cv.imread(`ocr_original_masked-${index}-${indicator}`) : cv.imread(`ocr_original-${index}-${indicator}`)
      let result = {} as any

      for (let field of data['images'][0]['fields']) {
        let name = field['name']
        let text = field['inferText']

        if (text === '') continue

        let vertices_list = field['boundingPoly']['vertices']
        let pts = []

        for (let vertice of vertices_list) {
          pts.push([vertice['x'], vertice['y']])
        }

        let topLeft = new cv.Point(pts[0][0], pts[0][1])
        let topRight = new cv.Point(pts[1][0], pts[1][1])
        let bottomRight = new cv.Point(pts[2][0], pts[2][1])
        let bottomLeft = new cv.Point(pts[3][0], pts[3][1])

        cv.line(img, topLeft, topRight, [0, 255, 0, 255], 2)
        cv.line(img, topRight, bottomRight, [0, 255, 0, 255], 2)
        cv.line(img, bottomRight, bottomLeft, [0, 255, 0, 255], 2)
        cv.line(img, bottomLeft, topLeft, [0, 255, 0, 255], 2)

        result[name] = text
      }

      cv.imshow(`ocr_output-${index}-${indicator}`, img)

      setOcrResult(result)
    }

    const cx = classNames.bind(styles);
  
    return (
        <div className={cx("contents")} style={{ justifyContent: 'center'}}>
            <div style={{display: 'flex', justifyContent: 'center' }}>
              <MuiFileInput
                  value={file}
                  id={`ocr-target-${index}-${indicator}`}
                  onChange={(e) => {renderSelected(e, `${indicator}`); setDisabled(false);}}
                  InputProps={{
                    inputProps: { 
                      accept: '.png, .jpeg, .jpg, .pdf'
                    },
                    startAdornment: <AttachFileIcon />
                  }}
                  clearIconButtonProps={{
                    title: "Remove",
                    children: <CloseIcon fontSize="small" />,
                  }}
                  label={label}
                  style={{ padding: 'auto', margin: '10px' }}
              />
              <Button variant="outlined" onClick={() => {requestWithFile(isMasked, `${indicator}`); setDisabled(true)}}>인식하기</Button>
            </div>
            <div id={`previewRegion-${index}-${indicator}`}>
                <div id={`ocr_images-${index}-${indicator}`} className={cx('photoFrame')} style={{ display: 'none' }}>
                    <canvas id={`ocr_original-${index}-${indicator}`} style={{ display: 'none' }}></canvas>
                    <canvas id={`ocr_original_masked-${index}-${indicator}`} style={{ display: 'none' }}></canvas>
                    <canvas id={`ocr_input-${index}-${indicator}`} style={{ maxWidth: image_width + 'px' }} onClick={(e) => handleShow(e)}></canvas>
                    <canvas id={`ocr_output-${index}-${indicator}`} style={{ maxWidth: image_width + 'px' }} onClick={(e) => handleShow(e)}></canvas>
                </div>
                <div id={`no_selected-${index}-${indicator}`}>
                </div>
                <div className={cx("setting")} id={`setting_bar-${index}-${indicator}`} style={{display: 'none'}}>
                <InputGroup style={{ justifyContent: "space-around" }}>
                    <Form.Check
                    type="switch"
                    id={`custom-switch-${index}-${indicator}`}
                    label="마스킹 활성화"
                    value={`${isMasked}`}
                    disabled={isDisabled}
                    defaultChecked={isMasked}
                    onChange={(e) => toggleMask(e)}
                    style={{ display: "flex", alignItems: "center" }}
                    />
                    <Button className="btn btn-secondary" data-target="#img-preview" onClick={handleShowEditor} disabled={isDisabled}>마스킹 설정</Button>
                </InputGroup>
                </div>
            </div>
            <Modal show={show} onHide={handleClose} onShow={showImg} size="xl">
                <Modal.Header closeButton>
                <h1>미리보기</h1>
                </Modal.Header>
                <Modal.Body>
                <canvas id={`ocr_mag-${index}-${indicator}`}></canvas>
                </Modal.Body>
            </Modal>
            <Modal show={showEditor} onHide={handleCloseEditor} onShow={showTemplate} size="lg">
                <Modal.Header closeButton>
                <h2>마스킹 설정</h2>
                </Modal.Header>
                <Modal.Body>
                <h4>마스킹 미리보기</h4>
                <canvas id={`ocr_mask_setting-${index}-${indicator}`} style={{maxWidth: 750}}></canvas>
                <Form className="template-selector">
                    <h4>템플릿 선택</h4>
                    {['radio'].map((type) => (
                    <div key={`inline-${type}`} className="mb-3">
                        <Form.Check
                        inline
                        label="Inbody 체성분"
                        name="group1"
                        type={type as FormCheckType}
                        id={`template-0-${index}-${indicator}`}
                        onClick={(e) => changeTemplate(e)}
                        />
                        <Form.Check
                        inline
                        label="Inbody 체수분"
                        name="group1"
                        type={type as FormCheckType}
                        id={`template-1-${index}-${indicator}`}
                        onClick={(e) => changeTemplate(e)}
                        />
                        <Form.Check
                        inline
                        label="exbody"
                        name="group1"
                        type={type as FormCheckType}
                        id={`template-2-${index}-${indicator}`}
                        onClick={(e) => changeTemplate(e)}
                        />
                        <Form.Check
                        inline
                        label="lookin' body"
                        name="group1"
                        type={type as FormCheckType}
                        id={`template-3-${index}-${indicator}`}
                        onClick={(e) => changeTemplate(e)}
                        />
                    </div>
                    ))}
                </Form>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default OcrParser;