declare module '@nivo/bar' {
    import * as React from 'react';
  
    interface BarDatum {
      field: string;
      value: number;
      percentage: number;
    }
  
    interface BarChartProps {
      data: BarDatum[];
      indexBy?: string | number;
      keys?: string[];
      groupMode?: string;
      layout?: string;
      valueScale?: object;
      indexScale?: object;
      reverse?: boolean;
      minValue?: number | string;
      maxValue?: number | string;
      valueFormat?: string | ((value: number) => string) | number;
      padding?: number;
      innerPadding?: number;
      width?: number;
      height?: number;
      pixelRatio?: number;
      margin?: object;
      enableLabel: boolean;
      enableGridX: boolean;
      enableGridY: boolean;
      colors: { scheme: string }
      axisLeft?: object | null;
      axisTop?: object | null;
      axisBottom?: object | null;
    }
  
    const ResponsiveBar: React.FC<BarChartProps>;
  
    export { ResponsiveBar };
  }