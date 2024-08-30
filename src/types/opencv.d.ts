declare namespace cv {
    class Mat {
      constructor(rows: number, cols: number, type: number);
      size(): { width: number, height: number };
      delete(): void;
    }
  
    class Point {
      constructor(x: number, y: number);
    }
  
    class Scalar {
      constructor(v0: number, v1: number, v2: number, v3: number);
    }
  
    function rectangle(
      img: Mat,
      pt1: Point,
      pt2: Point,
      color: Scalar,
      thickness: number,
      lineType?: number,
      shift?: number
    ): void;
  
    const CV_8UC3: number;
  }
  
  declare function onOpenCvReady(): void;