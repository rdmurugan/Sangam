import React, { useRef, useState, useEffect } from 'react';

// Professional SVG Icons
const PenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const EraserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53-6.36-6.36-3.54 3.53c-.78.79-.78 2.05 0 2.83z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const Whiteboard = ({ socket, roomId, userName }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [tool, setTool] = useState('pen'); // pen, eraser, clear

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleDrawData = (data) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      context.strokeStyle = data.color;
      context.lineWidth = data.lineWidth;

      if (data.type === 'start') {
        context.beginPath();
        context.moveTo(data.x, data.y);
      } else if (data.type === 'draw') {
        context.lineTo(data.x, data.y);
        context.stroke();
      } else if (data.type === 'clear') {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    socket.on('whiteboard-draw', handleDrawData);

    return () => {
      socket.off('whiteboard-draw', handleDrawData);
    };
  }, [socket]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    const context = canvas.getContext('2d');
    context.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    context.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    context.beginPath();
    context.moveTo(x, y);

    socket?.emit('whiteboard-draw', {
      roomId,
      type: 'start',
      x,
      y,
      color: context.strokeStyle,
      lineWidth: context.lineWidth
    });
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const context = canvas.getContext('2d');
    context.lineTo(x, y);
    context.stroke();

    socket?.emit('whiteboard-draw', {
      roomId,
      type: 'draw',
      x,
      y,
      color: context.strokeStyle,
      lineWidth: context.lineWidth
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    socket?.emit('whiteboard-draw', {
      roomId,
      type: 'clear'
    });
  };

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-header">
        <h3>Whiteboard</h3>
      </div>

      <div className="whiteboard-toolbar">
        <div className="tool-group">
          <button
            className={`tool-button ${tool === 'pen' ? 'active' : ''}`}
            onClick={() => setTool('pen')}
            title="Pen"
          >
            <PenIcon />
          </button>
          <button
            className={`tool-button ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            <EraserIcon />
          </button>
          <button
            className="tool-button"
            onClick={clearCanvas}
            title="Clear All"
          >
            <TrashIcon />
          </button>
        </div>

        <div className="tool-group">
          <label className="tool-label">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="color-picker"
          />
        </div>

        <div className="tool-group">
          <label className="tool-label">Size:</label>
          <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="line-width-slider"
          />
          <span className="line-width-value">{lineWidth}px</span>
        </div>
      </div>

      <div className="whiteboard-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="whiteboard-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      <div className="whiteboard-info">
        <p>Draw and collaborate in real-time</p>
      </div>
    </div>
  );
};

export default Whiteboard;
