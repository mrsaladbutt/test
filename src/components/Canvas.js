import React, { useRef, useEffect, useState } from "react";

function Canvas({
  nodes,
  setNodes,
  connections,
  setConnections,
  setIsEnoughConnections,
}) {
  const canvasRef = useRef(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState(null);
  const [tempConnection, setTempConnection] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    const canvasContext = canvas.getContext("2d");
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    nodes.forEach((node) => {
      canvasContext.fillStyle = "#ddd";
      canvasContext.fillRect(node.x, node.y, 100, 40);
      canvasContext.fillStyle = "#000";
      canvasContext.fillText(node.title, node.x + 5, node.y + 20);

      canvasContext.beginPath();
      canvasContext.arc(node.x + 50, node.y + 2, 6, 0, 2 * Math.PI);
      canvasContext.fill();
      canvasContext.beginPath();
      canvasContext.arc(node.x + 50, node.y + 38, 6, 0, 2 * Math.PI);
      canvasContext.fill();
    });

    connections.forEach((connection) => {
      const fromNode = nodes.find((n) => n.id === connection.from);
      const toNode = nodes.find((n) => n.id === connection.to);
      if (fromNode && toNode) {
        const fromX = fromNode.x + 50;
        const fromY = fromNode.y + 40;
        const toX = toNode.x + 50;
        const toY = toNode.y;

        canvasContext.beginPath();
        canvasContext.moveTo(fromX, fromY);
        canvasContext.lineTo(toX, toY);
        canvasContext.stroke();
      }
    });

    if (tempConnection) {
      canvasContext.beginPath();
      canvasContext.moveTo(tempConnection.fromX, tempConnection.fromY);
      canvasContext.lineTo(tempConnection.toX, tempConnection.toY);
      canvasContext.stroke();
    }
  }, [nodes, connections, tempConnection]);

  const handleMouseDown = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find(
      (node) =>
        x >= node.x && x <= node.x + 100 && y >= node.y && y <= node.y + 40
    );

    if (clickedNode) {
      const isTop =
        Math.abs(x - (clickedNode.x + 50)) < 6 &&
        Math.abs(y - clickedNode.y) < 6;
      const isBottom =
        Math.abs(x - (clickedNode.x + 50)) < 6 &&
        Math.abs(y - (clickedNode.y + 40)) < 6;

      if (isTop || isBottom) {
        const point = isTop ? "top" : "bottom";
        setConnecting({ nodeId: clickedNode.id, point });
      } else {
        const offsetX = x - clickedNode.x;
        const offsetY = y - clickedNode.y;
        setDraggingNode(clickedNode);
        setOffset({ x: offsetX, y: offsetY });
      }
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggingNode) {
      setNodes(
        nodes.map((node) =>
          node.id === draggingNode.id
            ? { ...node, x: x - offset.x, y: y - offset.y }
            : node
        )
      );
    } else if (connecting) {
      const fromNode = nodes.find((node) => node.id === connecting.nodeId);
      if (fromNode) {
        const fromX = fromNode.x + 50;
        const fromY = connecting.point === "top" ? fromNode.y : fromNode.y + 40;
        setTempConnection({ fromX, fromY, toX: x, toY: y });
      }
    }
  };

  const handleMouseUp = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (connecting) {
      const targetNode = nodes.find(
        (node) =>
          x >= node.x && x <= node.x + 100 && y >= node.y && y <= node.y + 40
      );

      if (targetNode) {
        const isTargetTop =
          Math.abs(x - (targetNode.x + 50)) < 6 &&
          Math.abs(y - targetNode.y) < 6;

        const endPoint = isTargetTop ? "top" : "bottom";

        const fromNode = nodes.find((node) => node.id === connecting.nodeId);
        const existingConnectionsFromBottom = connections.filter(
          (conn) => conn.from === connecting.nodeId && conn.start === "bottom"
        ).length;
        const existingConnectionsToTop = connections.filter(
          (conn) => conn.to === targetNode.id && conn.end === "top"
        ).length;
        const existingConnectionsFromTop = connections.filter(
          (conn) => conn.from === connecting.nodeId && conn.start === "top"
        ).length;
        const existingConnectionsToBottom = connections.filter(
          (conn) => conn.to === targetNode.id && conn.end === "bottom"
        ).length;

        if (
          fromNode &&
          ((connecting.point === "bottom" &&
            existingConnectionsFromBottom < 3 &&
            endPoint === "top" &&
            existingConnectionsToTop < 3) ||
            (connecting.point === "top" &&
              existingConnectionsFromTop < 3 &&
              endPoint === "bottom" &&
              existingConnectionsToBottom < 3))
        ) {
          const newConnection = {
            from: connecting.nodeId,
            to: targetNode.id,
            start: connecting.point,
            end: endPoint,
          };
          setConnections([...connections, newConnection]);
          setIsEnoughConnections(false);
        } else {
          setIsEnoughConnections(true);
        }
      }
      setConnecting(null);
      setTempConnection(null);
    }
    setDraggingNode(null);
  };

  const handleDoubleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find(
      (node) =>
        x >= node.x && x <= node.x + 100 && y >= node.y && y <= node.y + 40
    );

    if (clickedNode) {
      setEditingNode(clickedNode);
      setInputValue(clickedNode.title);
    }
  };
  const handleTextChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{ border: "1px solid black" }}
      />
      {editingNode && (
        <div className="input-wrapper">
          <input
            style={{
              position: "absolute",
              left: editingNode.x + 1,
              top: editingNode.y + 7,
            }}
            type="text"
            value={inputValue}
            onChange={handleTextChange}
            onBlur={() => {
              const updatedNodes = nodes.map((node) =>
                node.id === editingNode.id
                  ? { ...node, title: inputValue }
                  : node
              );
              setNodes(updatedNodes);
              setEditingNode(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Canvas;
