import React, { useRef, useState } from "react";
import Canvas from "./components/Canvas";
import "./css/App.css";
import { Button } from "antd";

function App() {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const nodeCount = useRef(0);
  const [isEnoughNodes, setIsEnoughNodes] = useState(false);
  const [isEnoughConnections, setIsEnoughConnections] = useState(false);

  const addNode = () => {
    if (nodes.length < 10) {
      const newNode = {
        id: nodeCount.current++,
        x: Math.random() * 600,
        y: Math.random() * 400,
        title: `Node ${nodeCount.current}`,
      };
      setNodes([...nodes, newNode]);
      setIsEnoughNodes(false);
    } else {
      setIsEnoughNodes(true);
    }
  };

  const clearNodes = () => {
    setNodes([]);
    setConnections([]);
    nodeCount.current = 0;
    setIsEnoughNodes(false);
    setIsEnoughConnections(false);
  };

  const exportGraph = () => {
    const graph = {
      nodes,
      connections,
    };
    console.log(JSON.stringify(graph, null, 2));
  };

  return (
    <div className="App">
      <Button type="primary" onClick={addNode}>
        Create Node
      </Button>
      <Button type="primary" onClick={exportGraph}>
        Export
      </Button>
      <Button onClick={clearNodes}>Clear</Button>
      <Canvas
        nodes={nodes}
        setNodes={setNodes}
        connections={connections}
        setConnections={setConnections}
        setIsEnoughConnections={setIsEnoughConnections}
      />
      <div className="warning-message">
        {isEnoughNodes ? "You cant create more than 10 nodes" : ""}
      </div>
      <div className="warning-message">
        {isEnoughConnections ? "You cant create more than 3 connections" : ""}
      </div>
    </div>
  );
}

export default App;
