import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import FormData from 'form-data';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MuiFileInput } from 'mui-file-input'
import CloseIcon from '@mui/icons-material/Close'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import * as pdfjs from 'pdfjs-dist'
import { BASE_BACKEND_URL } from 'api/commons/request';
import { PDFDocument } from 'pdf-lib'
import { getDocument, RenderTask } from 'pdfjs-dist';
import { Box, Stack, ToggleButtonGroup, Button, FormControl, Modal, ModalDialog, CircularProgress } from '@mui/joy';
import { Transition } from 'react-transition-group'
import PdfCarousel from './PdfCarousel';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  `http://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`,
  import.meta.url
).toString()


interface OcrParserProps {  
  file: File | null,  
  cv: any,
  useOcr: boolean,
  children?: React.ReactNode,
  label?: string,
  index?: number,
  video?: boolean,
  multiple: boolean,
  setFile: (file: File | null) => void,
  setOcrResult: (result: any) => void
}

const OcrParser = ({ file, cv, useOcr=false, label="파일 선택", index=0, video=false, multiple=false, setFile, setOcrResult }: OcrParserProps) => {
  const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
  
  const [multipleFiles, setMultipleFiles] = useState<File[]>([])

  const [pageCount, setPageCount] = useState<number>(0)

  const originalCanvasRefs = useRef<HTMLCanvasElement[]>([]);
  const originalCanvasContainerRefs = useRef<HTMLDivElement>(null);
  const [originalCanvasOffset, setOriginalCanvasOffset] = useState(0)

  const ocrOriginalCanvasRefs = useRef<HTMLCanvasElement[]>([]);
  const ocrOriginalCanvasContainerRefs = useRef<HTMLDivElement>(null);
  const [ocrOriginalCanvasOffset, setOcrOriginalCanvasOffset] = useState(0)

  const showingCanvasRefs = useRef<HTMLCanvasElement[]>([]);
  const showingCanvasContainerRefs = useRef<HTMLDivElement>(null);
  const [showingCanvasOffset, setShowingCanvasOffset] = useState(0)

  const ocrCanvasRefs = useRef<HTMLCanvasElement[]>([]);
  const ocrCanvasContainerRefs = useRef<HTMLDivElement>(null);
  const [ocrCanvasOffset, setOcrCanvasOffset] = useState(0)

  const maskingTypeBarRefs = useRef<HTMLDivElement>(null);
  const parseTypeBarRefs = useRef<HTMLDivElement>(null);

  const [showOriginal, setShowOriginal] = useState(false)

  const [maskNumber, setMaskNumber] = useState(-1)
  const [parseType, setParseType] = useState(0)

  const [showTarget, setShowTarget] = useState(0)

  const nodeRef = useRef(null)
  const [videoUrl, setVideoUrl] = useState("")

  const [isOcrRunning, setIsOcrRunning] = useState(false)
  const [recognitionActivation, setRecognitionActivation] = useState(false)

  const renderTasks = useRef<RenderTask[]>([])
  const renderingInProgress = useRef(false)

  const convertImageToPng = (file: File): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(async (blob) => {
              if (blob) {
                resolve(new Uint8Array(await blob.arrayBuffer()));
              } else {
                reject('Error converting image to PNG.');
              }
            }, 'image/png');
          } else {
            reject('Error getting canvas context.');
          }
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const preprocessSelected = async (files: File[]) => {
    let pdfConvertedFiles = await Promise.all(files.map(async (file: File) => {
      if (file.type.includes('image')) {
        const imageData = await convertImageToPng(file)
        const pdfDoc = await PDFDocument.create()
        const image = await pdfDoc.embedPng(imageData)

        const { width, height } = image.scale(1)
        const page = pdfDoc.addPage([width, height])
        page.drawImage(image, { x: 0, y: 0, width, height })

        const pdfBytes = await pdfDoc.save()

        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' })
        return new File([pdfBlob], 'converted.pdf', { type: 'application/pdf' })
      }
      else return file
    }))

    const mergedPdf = await PDFDocument.create();

    for (const file of pdfConvertedFiles) {
      // Read the PDF file
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Copy pages from the current PDF to the merged PDF
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    // Serialize the merged PDF document to bytes
    const mergedPdfBytes = await mergedPdf.save();

    // Create a File object from the merged PDF data
    const pdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const processedFile = new File([pdfBlob], 'merged.pdf', { type: 'application/pdf' });

    setFile(processedFile)
  }

  const renderVideo = useCallback(async () => {
    if (!file) return false
    setVideoUrl(URL.createObjectURL(file))
  }, [file])

  // Display selected image by input element
  const renderSelected = useCallback(async (init: boolean) => {
    if (!file || video) return false

    if (renderingInProgress.current) return;
    renderingInProgress.current = true

    try {
      renderTasks.current.forEach(task => task.cancel())
      renderTasks.current = [];

      const pdfData = await file.arrayBuffer()
      const pdfDoc = await getDocument({ data: pdfData }).promise
      console.log(pdfDoc)
      setPageCount(pdfDoc.numPages)

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {

        let page = await pdfDoc.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1 });

        showingCanvasContainerRefs.current?.setAttribute("style", "display: flex;")
        ocrCanvasContainerRefs.current?.setAttribute("style", "display: flex;")
        maskingTypeBarRefs.current?.setAttribute("style", "display: flex;")
        parseTypeBarRefs.current?.setAttribute("style", "display: flex;")

        const containerWidth = showingCanvasContainerRefs.current?.clientWidth ?? viewport.width
        const scale = containerWidth / viewport.width
        const scaledViewport = page.getViewport({ scale })
        
        // 캔버스 요소 가져오기 및 설정
        const showingCanvas = showingCanvasRefs.current[pageNum - 1];    
        const showingContext = showingCanvas.getContext('2d', { willReadFrequently: true });

        if (showingContext) {
          showingCanvas.width = scaledViewport.width;
          showingCanvas.height = scaledViewport.height;

          const renderContext = {
            canvasContext: showingContext,
            viewport: scaledViewport,
          };

          const renderTask = page.render(renderContext)
          renderTasks.current.push(renderTask)
          await renderTask.promise;
        }

        page = await pdfDoc.getPage(pageNum)
        const originalCanvas = originalCanvasRefs.current[pageNum - 1];
        const originalContext = originalCanvas.getContext('2d', { willReadFrequently: true });

        if (originalContext) {
          originalCanvas.width = viewport.width;
          originalCanvas.height = viewport.height;

          const renderContext = {
            canvasContext: originalContext,
            viewport: viewport,
          };

          const renderTask = page.render(renderContext)
          renderTasks.current.push(renderTask)
          await renderTask.promise;
        }

        showingCanvas.setAttribute("style", "display: flex;")
      }

      if (!init) setMaskNumber(index)
      return true
    } finally {
      renderingInProgress.current = false
    }
  }, [file, index, video])

  // Request clova api when click the convert button
  const requestWithFile = async () => {
    setIsOcrRunning(true)
    const blobs: Blob[] = await Promise.all(
      originalCanvasRefs.current.map((canvas) => {
        if (canvas) {
          return toBlobPromise(canvas, 'image/png');
        }
        return Promise.resolve(new Blob()); // 빈 Blob을 반환
      })
    )

    const result = await Promise.all(blobs.map(async (blob, index) => {
      if (!blob) return

      var file = new File([blob], "ddd.png", {type: "image/png"}) 
      
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
      
      let datum = await axios.post(
        `${BASE_BACKEND_URL}/api/ocr`, // BASE_OCR_URL = "https://6n1q18xmim.apigw.ntruss.com" ocr api 주소 custom/v1/33534/22e6e62df0499ec997a290b3f8ac2003ab139c4f8d146b2df91646b3fb11a2ea/infer
        formData,
        {
          headers: { 
            //'X-OCR-SECRET': 'QnNTQ2haUW1SWmVDWEtScE9UaXBaVE9pZEZlUGVEU04=', // 네이버 클로바 secret key
            ...formData.getHeaders ? formData.getHeaders() : { 
              'Content-Type': 'multipart/form-data',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': 'true'              
            },
            Authorization: "Bearer " + accessToken
          }
        }
      ).then(res => {
        if (res.status === 200) {
          console.log('requestWithFile response:', res.data.response)
          return drawBoxes(res.data.response, index) // res.data를 프론트로 넘겨주면 됨
        }
      }).catch(e => {
          console.warn('requestWithFile error', e)
          alert("OCR API 호출에 실패하였습니다. 잠시 후 다시 시도해주세요.")
          return null
      })

      return datum
    }))
    
    setOcrResult({parseType: parseType, result: result})
    setIsOcrRunning(false)
  }

  const masking = useCallback((template: number) => {
    if (originalCanvasRefs.current.length > 0 ) {
      renderSelected(true).then(() => {
        originalCanvasRefs.current.forEach((ref) => {
          // inbody체성분,  inbdoy체수분, exbody, lookin' body 순
          const canvas = ref;        
  
          const x_min = [0, 0, 0.04, 0.04, 0.03, 0.04]
          const x_max = [0, 0, 0.64, 0.64, 0.95, 0.64]
  
          const y_min = [0, 0, 0.07, 0.07, 0.08, 0.07]
          const y_max = [0, 0, 0.11, 0.11, 0.14, 0.11]
  
          let img = cv.imread(ref)
  
          let topLeft = new cv.Point(canvas.width * x_min[template], canvas.height * y_min[template])
          let bottomRight = new cv.Point(canvas.width * x_max[template], canvas.height * y_max[template])
  
          cv.rectangle(img, topLeft, bottomRight, [255, 255, 255, 255], -1)
          cv.rectangle(img, topLeft, bottomRight, [210, 210, 230, 255], 1)
          cv.imshow(ref, img)
        })
        showingCanvasRefs.current.forEach((ref) => {
          // inbody체성분,  inbdoy체수분, exbody, lookin' body 순
          const canvas = ref;        
  
          const x_min = [0, 0, 0.04, 0.04, 0.03, 0.04]
          const x_max = [0, 0, 0.64, 0.64, 0.95, 0.64]
  
          const y_min = [0, 0, 0.07, 0.07, 0.08, 0.07]
          const y_max = [0, 0, 0.11, 0.11, 0.14, 0.11]
  
          let img = cv.imread(ref)
  
          let topLeft = new cv.Point(canvas.width * x_min[template], canvas.height * y_min[template])
          let bottomRight = new cv.Point(canvas.width * x_max[template], canvas.height * y_max[template])
  
          cv.rectangle(img, topLeft, bottomRight, [255, 255, 255, 255], -1)
          cv.rectangle(img, topLeft, bottomRight, [210, 210, 230, 255], 1)
          cv.imshow(ref, img)
        })
      })    
    }
  }, [cv, renderSelected])

  // Boxing function with the result of ocr by CLOVA API; Requiring opencv.js
  const drawBoxes = (data: any, indicator: number) => {
    let img = cv.imread(originalCanvasRefs.current[indicator])
    let showImg = cv.imread(showingCanvasRefs.current[indicator])
    let scale = showingCanvasRefs.current[indicator].width / originalCanvasRefs.current[indicator].width

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

      let scaledTopLeft = new cv.Point(pts[0][0] * scale, pts[0][1] * scale)
      let scaledTopRight = new cv.Point(pts[1][0] * scale, pts[1][1] * scale)
      let scaledBottomRight = new cv.Point(pts[2][0] * scale, pts[2][1] * scale)
      let scaledBottomLeft = new cv.Point(pts[3][0] * scale, pts[3][1] * scale)

      cv.line(img, topLeft, topRight, [0, 255, 0, 255], 2)
      cv.line(img, topRight, bottomRight, [0, 255, 0, 255], 2)
      cv.line(img, bottomRight, bottomLeft, [0, 255, 0, 255], 2)
      cv.line(img, bottomLeft, topLeft, [0, 255, 0, 255], 2)

      cv.line(showImg, scaledTopLeft, scaledTopRight, [0, 255, 0, 255], 1)
      cv.line(showImg, scaledTopRight, scaledBottomRight, [0, 255, 0, 255], 1)
      cv.line(showImg, scaledBottomRight, scaledBottomLeft, [0, 255, 0, 255], 1)
      cv.line(showImg, scaledBottomLeft, scaledTopLeft, [0, 255, 0, 255], 1)

      result[name] = text
    }

    cv.imshow(ocrOriginalCanvasRefs.current[indicator], img)
    cv.imshow(ocrCanvasRefs.current[indicator], showImg)

    return result
  }

  const toBlobPromise = (canvas: HTMLCanvasElement, type: string): Promise<Blob> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, type);
    });
  };

  useEffect(() => {
    if (video) { renderVideo() }
    else { renderSelected(false).then((result) => {if (result) setRecognitionActivation(true)}) }    
  }, [renderSelected, file, video, renderVideo])

  useEffect(() => {
    masking(maskNumber)
  }, [maskNumber, masking])
  
  return (
    <>
    <Stack sx={{ justifyContent: 'center'}} gap={2}>
      <Box sx={{display: 'flex', justifyContent: 'center' }}>
        {
          multiple ? 
          <MuiFileInput
              multiple={multiple}
              value={multipleFiles}
              onChange={(e: File[]) => {setMultipleFiles(e); preprocessSelected(e)}}
              InputProps={{
                inputProps: {
                  accept: 'image/*, application/pdf'
                },
                startAdornment: <AttachFileIcon />
              }}
              clearIconButtonProps={{
                title: "Remove",
                children: <CloseIcon fontSize="small" />,
                disabled: !recognitionActivation
              }}
              label={label}
              sx={{ padding: 'auto', margin: '10px' }}
          /> :
          <MuiFileInput
              multiple={multiple}
              value={multipleFiles[0]}
              onChange={async (e: File | null) => {
                if (e) {
                    if (!video) {
                      setMultipleFiles([e])
                      preprocessSelected([e])
                    }
                    else {
                      setMultipleFiles([e])
                      setFile(e)
                    }
                  }                
                }
              }
              InputProps={{
                inputProps: {
                  accept: video ? 'video/*' : 'image/*, application/pdf'
                },
                startAdornment: <AttachFileIcon />
              }}
              clearIconButtonProps={{
                title: "Remove",
                children: <CloseIcon fontSize="small" />,
                disabled: !recognitionActivation
              }}
              label={label}
              sx={{ padding: 'auto', margin: '10px' }}
          />
        }        
        {useOcr && <Button variant="outlined" onClick={() => requestWithFile()} disabled={!recognitionActivation}>{isOcrRunning ? <CircularProgress /> : '인식하기'}</Button>}
      </Box>
      <Stack sx={{ m: 'auto', justifyContent: 'center' }} gap={2}>
        {videoUrl !== "" && <video controls src={videoUrl} style={{ width: "100%" }}></video>}
        <Stack direction='row' sx={{ justifyContent: 'center' }}>
          <PdfCarousel
            url={''} 
            pageCount={pageCount} 
            canvasRefs={showingCanvasRefs} 
            containerRefs={showingCanvasContainerRefs} 
            canvasOffset={showingCanvasOffset}
            tooltipMsg='크게 보기'
            style={{ width: '100%', maxWidth: '350px', border: '1px solid gray', overflowX: 'hidden', display: 'none', flexDirection: 'column' }}
            onClick={(e) => {
              if (showingCanvasRefs.current.includes(e.target as HTMLCanvasElement)) {
                setShowOriginal(true); setShowTarget(0)
              }
            }}
            setPageCount={setPageCount} 
            setCanvasOffset={setShowingCanvasOffset}            
          />
          {useOcr && <PdfCarousel 
            url={''} 
            pageCount={pageCount} 
            canvasRefs={ocrCanvasRefs} 
            containerRefs={ocrCanvasContainerRefs} 
            canvasOffset={ocrCanvasOffset} 
            tooltipMsg='크게 보기'
            style={{ width: '100%', maxWidth: '350px', border: '1px solid gray', overflowX: 'hidden', display: 'none', flexDirection: 'column' }}
            onClick={(e) => {
              if (ocrCanvasRefs.current.includes(e.target as HTMLCanvasElement)) {
                setShowOriginal(true); setShowTarget(1)
              }
            }}
            setPageCount={setPageCount}
            setCanvasOffset={setOcrCanvasOffset}            
          />}
        </Stack>        
        {useOcr &&
        <>
          <FormControl 
            orientation='horizontal' 
            sx={{ justifyContent: 'center', display: 'none' }}
            ref={maskingTypeBarRefs} 
          >
            <Button variant='plain' disabled>마스킹 타입 선택</Button>
            <ToggleButtonGroup                  
              value={`${maskNumber}`}
              onChange={(_, value) => {
                setMaskNumber(+(value ?? '0'));
              }}
            >                  
              <Button value='0'>None</Button>
              <Button value='1'>Imoove</Button>
              <Button value='2'>InBody (체성분)</Button>
              <Button value='3'>InBody (체수분)</Button>
              <Button value='4'>ExBody</Button>
              <Button value='5'>LookinBody</Button>
            </ToggleButtonGroup>
          </FormControl>
          <FormControl 
            orientation='horizontal' 
            sx={{ justifyContent: 'center', display: 'none' }}
            ref={parseTypeBarRefs} 
          >
            {false &&
            <>
              <Button variant='plain' disabled>입력 방법 선택</Button>
              <ToggleButtonGroup                  
                value={`${parseType}`}
                onChange={(_, value) => {
                  setParseType(+(value ?? '0'));
                }}
              >                  
                <Button value='0'>첫번째</Button>
                <Button value='1'>마지막</Button>
                <Button value='2'>평균</Button>
                <Button value='3'>최댓값</Button>
                <Button value='4'>최솟값</Button>
              </ToggleButtonGroup>
            </>
            }
          </FormControl>
        </>
        }
      </Stack>
    </Stack>
    <Transition nodeRef={nodeRef} in={showOriginal} timeout={400}>
      {(state: string) => (
        <Modal 
          ref={nodeRef}
          keepMounted
          open={!['exited', 'exiting'].includes(state)}
          onClose={() => setShowOriginal(false)}
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
                my: '30px',
                ml: 'calc(var(--Sidebar-width) / 2)',
                opacity: 0,
                transition: `opacity 150ms`,
                ...{
                entering: { opacity: 1 },
                entered: { opacity: 1 },
                }[state],
            }}
          >
            <PdfCarousel
              url={''} 
              pageCount={pageCount} 
              canvasRefs={originalCanvasRefs} 
              containerRefs={originalCanvasContainerRefs} 
              canvasOffset={originalCanvasOffset} 
              className='scrollable vertical'
              style={{ width: 
                originalCanvasRefs.current[0] === undefined ? 'calc(90vw - var(--Sidebar-width))' : `${originalCanvasRefs.current[0].getAttribute('width')}px`, 
                height: 'calc(90vh - 60px)', 
                border: '1px solid gray', 
                position: 'relative', 
                overflowX: 'hidden',
                display: showTarget === 0 ? 'block' : 'none'
              }}
              onClick={undefined}
              setPageCount={setPageCount} 
              setCanvasOffset={setOriginalCanvasOffset}            
            />
            <PdfCarousel
              url={''} 
              pageCount={pageCount} 
              canvasRefs={ocrOriginalCanvasRefs} 
              containerRefs={ocrOriginalCanvasContainerRefs} 
              canvasOffset={ocrOriginalCanvasOffset} 
              className='scrollable vertical'
              style={{ width: 
                ocrOriginalCanvasRefs.current[0] === undefined ? 'calc(90vw - var(--Sidebar-width))' : `${ocrOriginalCanvasRefs.current[0].getAttribute('width')}px`, 
                height: 'calc(90vh - 60px)', 
                border: '1px solid gray', 
                position: 'relative', 
                overflowX: 'hidden',
                display: showTarget === 1 ? 'block' : 'none'
              }}
              onClick={undefined}
              setPageCount={setPageCount} 
              setCanvasOffset={setOcrOriginalCanvasOffset}            
            />            
          </ModalDialog> 
        </Modal>
        )}
      </Transition>
    </>
  )
}

export default OcrParser;