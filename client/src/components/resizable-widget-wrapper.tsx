import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripHorizontal, Settings, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ResizableWidgetWrapperProps {
  title: string;
  children: React.ReactNode;
  initialWidth?: number;
  initialHeight?: number;
  initialX?: number;
  initialY?: number;
  minWidth?: number;
  minHeight?: number;
  onResize?: (width: number, height: number) => void;
  onMove?: (x: number, y: number) => void;
  onRemove?: () => void;
  className?: string;
}

export function ResizableWidgetWrapper({
  title,
  children,
  initialWidth = 300,
  initialHeight = 200,
  initialX = 0,
  initialY = 0,
  minWidth = 200,
  minHeight = 150,
  onResize,
  onMove,
  onRemove,
  className = ''
}: ResizableWidgetWrapperProps) {
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [x, setX] = useState(initialX);
  const [y, setY] = useState(initialY);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const widgetRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize') => {
    e.preventDefault();

    if (action === 'drag') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - x,
        y: e.clientY - y
      });
    } else if (action === 'resize') {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width,
        height
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Boundary checking
      const container = widgetRef.current?.parentElement;
      if (container) {
        const maxX = container.clientWidth - width;
        const maxY = container.clientHeight - height;

        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));

        setX(constrainedX);
        setY(constrainedY);
        onMove?.(constrainedX, constrainedY);
      }
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      const newWidth = Math.max(minWidth, resizeStart.width + deltaX);
      const newHeight = Math.max(minHeight, resizeStart.height + deltaY);

      setWidth(newWidth);
      setHeight(newHeight);
      onResize?.(newWidth, newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, width, height, x, y]);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (!isMaximized) {
      // Store current size and position before maximizing
      const container = widgetRef.current?.parentElement;
      if (container) {
        setWidth(container.clientWidth - 20);
        setHeight(container.clientHeight - 20);
        setX(10);
        setY(10);
      }
    } else {
      // Restore original size
      setWidth(initialWidth);
      setHeight(initialHeight);
      setX(initialX);
      setY(initialY);
    }
  };

  return (
    <Card
      ref={widgetRef}
      className={`absolute bg-card border border-border shadow-xl rounded-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        left: `${x}px`,
        top: `${y}px`,
        zIndex: isDragging || isResizing ? 1000 : 1,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <CardHeader className="pb-2 px-4 pt-2">
        <div className="flex items-center justify-between">
          <CardTitle
            className="text-sm font-medium cursor-grab flex items-center gap-2"
            onMouseDown={(e) => handleMouseDown(e, 'drag')}
          >
            <GripHorizontal className="h-4 w-4 text-gray-400" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMaximize}
              className="h-6 w-6 p-0"
            >
              {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onClick={onRemove}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Kaldır
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 h-full overflow-auto">
        <div className="h-full w-full flex flex-col" style={{ fontSize: `${Math.max(0.75, Math.min(1.1, width / 280))}rem` }}>
          {children}
        </div>
        {/* Resize handle */}
        <div
          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize bg-gray-400 hover:bg-gray-500 transition-colors opacity-70 hover:opacity-100"
          onMouseDown={(e) => handleMouseDown(e, 'resize')}
          style={{
            clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)',
            borderRadius: '0 0 4px 0'
          }}
        />
      </CardContent>
    </Card>
  );
}