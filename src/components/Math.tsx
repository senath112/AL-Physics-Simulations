import { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathProps {
  math: string;
}

export function InlineMath({ math }: MathProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: false,
          throwOnError: false,
        });
      } catch (err) {
        console.error('KaTeX rendering error:', err);
      }
    }
  }, [math]);

  return <span ref={containerRef} />;
}

export function BlockMath({ math }: MathProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: true,
          throwOnError: false,
        });
      } catch (err) {
        console.error('KaTeX rendering error:', err);
      }
    }
  }, [math]);

  return <div ref={containerRef} className="my-2 overflow-x-auto py-1 text-center" />;
}
