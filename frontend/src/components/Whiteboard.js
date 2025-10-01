import React, { useRef, useState, useEffect } from 'react';

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
            ✏️
          </button>
          <button
            className={`tool-button ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            🧹
          </button>
          <button
            className="tool-button"
            onClick={clearCanvas}
            title="Clear All"
          >
            🗑️
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
