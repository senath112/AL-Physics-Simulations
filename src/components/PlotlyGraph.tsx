import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-basic-dist-min';

interface PlotlyGraphProps {
  data: Plotly.Data[];
  layout: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
  className?: string;
  style?: React.CSSProperties;
}

export function PlotlyGraph({ data, layout, config, className, style }: PlotlyGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const defaultConfig: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: false,
      ...config,
    };

    Plotly.newPlot(containerRef.current, data, layout, defaultConfig).then((plot) => {
      plotRef.current = plot;
    });

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        Plotly.purge(containerRef.current);
      }
    };
  }, []);

  // React to data or layout updates
  useEffect(() => {
    if (!containerRef.current || !plotRef.current) return;
    
    Plotly.react(containerRef.current, data, layout, {
      responsive: true,
      displayModeBar: false,
      ...config,
    });
  }, [data, layout, config]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: '220px', ...style }}
    />
  );
}
