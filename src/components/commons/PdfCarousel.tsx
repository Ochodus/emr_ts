import { ChevronLeftRounded, ChevronRightRounded } from "@mui/icons-material";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/joy";
import { SxProps } from "@mui/material";
import { BASE_FILE_URL } from "api/commons/request";
import { getDocument } from "pdfjs-dist";
import { useCallback, useEffect, useMemo, useState } from "react";

interface PdfCarouselProps {
    url: string,
    pageCount: number,    
    canvasRefs: React.MutableRefObject<HTMLCanvasElement[]>,
    containerRefs: React.RefObject<HTMLDivElement>,
    canvasOffset: number,
    tooltipMsg?: string,
    className?: string,
    hasRendering?: React.MutableRefObject<boolean>,
    style?: SxProps | undefined,
    video?: boolean,
    onClick?: React.MouseEventHandler<HTMLDivElement>,
    setPageCount: React.Dispatch<React.SetStateAction<number>>,
    setCanvasOffset: React.Dispatch<React.SetStateAction<number>>,
}

const PdfCarousel = ({
    url,
    pageCount,
    canvasRefs,
    containerRefs,
    canvasOffset,
    tooltipMsg,
    className,
    hasRendering,
    style,
    video,
    onClick,
    setPageCount,
    setCanvasOffset
}: PdfCarouselProps) => {
    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

    const [videoUrl, setVideoUrl] = useState("")

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const renderPage = useCallback(async (url: string) => {
        console.log(video)
        if (url === "") { if (hasRendering) hasRendering.current = false; return }
        if (video) {
            let response = await fetch(`${BASE_FILE_URL}${url}`, config)
            let file = new File([await response.blob()], `${url}.mp4`, {type: 'video/mp4'})

            if (!file) { if (hasRendering) hasRendering.current = false; return}

            setVideoUrl(URL.createObjectURL(file))

            containerRefs.current?.setAttribute("style", "display: flex;"); 
        }
        else {
            let response = await fetch(`${BASE_FILE_URL}${url}`, config)
            let file = new File([await response.blob()], `${url}.pdf`, {type: 'application/pdf'})

            if (!file) { if (hasRendering) hasRendering.current = false; return }

            const pdfData = await file.arrayBuffer()
            const pdfDoc = await getDocument({ data: pdfData }).promise

            setPageCount(pdfDoc.numPages)

            for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                const page = await pdfDoc.getPage(pageNum)
                console.log(page)
                const viewport = page.getViewport({ scale: 1 });

                containerRefs.current?.setAttribute("style", "display: flex;")
                const containerWidth = containerRefs.current?.clientWidth ?? viewport.width
                const scale = containerWidth / viewport.width
                const scaledViewport = page.getViewport({ scale })
                
                // 캔버스 요소 가져오기 및 설정
                const canvas = canvasRefs.current[pageNum - 1];        
                const context = canvas.getContext('2d');

                if (context) {
                    canvas.width = scaledViewport.width;
                    canvas.height = scaledViewport.height;

                    const renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport,
                    };

                    await page.render(renderContext).promise;
                }

                canvas.setAttribute("style", "display: flex;")
            }
        }
        if (hasRendering) hasRendering.current = false
    }, [config, canvasRefs, containerRefs, setPageCount, video, hasRendering])

    useEffect(() => {
        console.log(url)
        console.log(hasRendering?.current)
        if (hasRendering !== undefined && !hasRendering?.current) {
            renderPage(url)
            hasRendering.current = true
        }
    }, [renderPage, hasRendering, url])

    return (
        <Box
            ref={containerRefs}
            className={className}
            sx={style ? style : { width: '50%', border: '1px solid gray', flexDirection: 'column', overflowX: 'hidden', display: 'none', m: 'auto' }}            
        >
            {pageCount > 1 && !video &&
            <Stack direction='row' sx={{ p: 1, width: canvasRefs.current[0] === undefined ? '100%' : `${canvasRefs.current[0].getAttribute('width')}px`, justifyContent: 'space-between', borderBottom: '1px dashed gray' }}>            
                <IconButton onClick={() => setCanvasOffset(prevState => prevState === 0 ? prevState : prevState - 1)}>
                    <ChevronLeftRounded/>
                </IconButton>
                <Box sx={{ flex: '1 1 auto', p: 1, display: 'flex' }}>
                    <Typography level="h4" sx={{ m: 'auto', px: 1, borderRadius: '5px', "&:hover": { backgroundColor: 'gray'} }}>
                        {`${canvasOffset+1}/${pageCount}`}
                    </Typography>
                </Box>
                <IconButton onClick={() => setCanvasOffset(prevState => prevState === pageCount - 1 ? prevState : prevState + 1)}>
                    <ChevronRightRounded/>
                </IconButton>                     
            </Stack>
            }    
            {tooltipMsg ? <Tooltip title={tooltipMsg} placement="right" onClick={onClick}>
                {video ? <video controls src={videoUrl} style={{ width: "100%" }}></video> : <Stack 
                    direction='row'
                    sx={{ position: 'relative', left: `${canvasOffset * -100}%`, transition: 'left 0.2s ease'}}
                    onClick={onClick}
                >
                    {Array.from({ length: pageCount }, (_, index) => (
                        <canvas key={index} ref={el => el && (canvasRefs.current[index] = el)}></canvas>
                    ))}
                </Stack>}      
            </Tooltip> :
            video ? <video controls src={videoUrl} style={{ width: "100%" }}></video> : <Stack 
                direction='row'
                sx={{ position: 'relative', left: `${canvasOffset * -100}%`, transition: 'left 0.2s ease'}}
                onClick={onClick}
            >
                {Array.from({ length: pageCount }, (_, index) => (
                    <canvas key={index} ref={el => el && (canvasRefs.current[index] = el)}></canvas>
                ))}
            </Stack>}
        </Box>
    )
}

export default PdfCarousel