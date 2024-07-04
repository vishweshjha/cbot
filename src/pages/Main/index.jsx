import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  ConnectionLineType,
  SmoothStepEdge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import CustomNode from "../../components/CustomNode";
import Navbar from "../../layout/Navbar";
import Toolbar from "../../layout/Toolbar";
import SettingBar from "../../layout/SettingBar";
import ConnectionLine from "../../components/ConnectionLine";
import MessageNode from "../../components/MessageNode";

const defaultViewport = { x: 0, y: 0, zoom: 1.2 };

const minimapStyle = {
  height: 120,
};
const initBgColor = "#1A192B";
let id = 0;
const getId = () => `dndnode_${id++}`;
const nodeTypes = {
  customNode: CustomNode
};

const layoutNodesAndEdges = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  dagreGraph.setGraph({ rankdir: 'LR' });
  
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 100, height: 50 });
  });
  
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  
  dagre.layout(dagreGraph);
  
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 10,
      y: nodeWithPosition.y - 50,
    };
    return node;
  });
};

const Main = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showSettingBar, setShowSettingBar] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [showToolBar, setShowToolBar] = useState(true);
  const [bgColor, setBgColor] = useState(initBgColor);
  const [openEditor, setOpenEditor] = useState(false);
  const [nodeName, setNodeName] = useState("null");

  useEffect(() => {
    const initialNodes = [
      {
        id: "1",
        type: "messageNode",
        data: { label: "Start Node" },
        position: { x: 40, y: 50 },
      },
    ];

    const initialEdges = [
      {
        id: "e1-2",
        source: "1",
        target: "2",
        animated: true,
        style: { stroke: "#fff" },
      },
      {
        id: "e2a-3",
        source: "2",
        target: "3",
        sourceHandle: "a",
        animated: true,
        style: { stroke: "#fff" },
      },
      {
        id: "e2b-4",
        source: "2",
        target: "4",
        sourceHandle: "b",
        animated: true,
        style: { stroke: "#fff" },
      },
    ];

    const laidOutNodes = layoutNodesAndEdges(initialNodes, initialEdges);
    setNodes(laidOutNodes);
    setEdges(initialEdges);
  }, []);

  const [variables, setVariables] = useState([
    { key: "Company", value: "ChatBot" },
    { key: "Name", value: "John Doe" },
    { key: "Url", value: "https://react-flow.com" },
    { key: "Phone", value: "123145432452364" },
  ]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, animated: false, markerEnd: { type: "arrowclosed" } },
          eds,
        ),
      ),
    [],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const selectNode = (props) => {
    debugger;
    setSelectedNodeData(props);
    setShowSettingBar(true);
    setShowToolBar(false);
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("type");
      const label = event.dataTransfer.getData("label");
      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      let nodedata = {};
      switch (label) {
        case "Message":
          nodedata["content"] = "";
          break;
        case "Questions":
          nodedata["qa_q"] = "";
          nodedata["qa_a"] = "";
          break;
        case "Options":
          nodedata["option_header"] = "";
          nodedata["option_footer"] = "";
          nodedata["option_content"] = "";
          nodedata["data"] = [];
          break;
        case "Quick Answers":
          nodedata["qu_header"] = "";
          nodedata["qu_footer"] = "";
          nodedata["qu_content"] = "";
          nodedata["qu_data"] = [];
          break;
        case "Answer with Text":
          nodedata["answer_content"] = "";
          nodedata["answer_buttons"] = [];
          break;
        case "Upload Media":
          nodedata["media_type"] = "";
          nodedata["media_content"] = null;
          nodedata["media_name"] = "";
          break;
        case "Talk with advisor":
          nodedata["advisor_name"] = "John Doe";
          break;
        case "Web Service":
          nodedata["api_url"] = "https://example...";
          nodedata["api_method"] = "GET";
          nodedata["api_headers"] = [];
          nodedata["api_params"] = [];
          nodedata["api_res_variable"] = null;
          nodedata["api_res_data"] = null;
          break;
        default:
         alert("Bauaa")
          break;
      }

      const newNode = {
        id: getId(),
        type: "customNode",
        position,
        data: { label: `${label}`, nodedata, setNodes, getId, selectNode },
      };

      setNodes((nds) => layoutNodesAndEdges(nds.concat(newNode), edges));
    },
    [reactFlowInstance],
  );

  const exportJson = () => {
    const obj = { nodes: nodes, links: edges };
    const jsonString = JSON.stringify(obj);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    link.click();
  };

  const onPaneClick = (event) => {
    setOpenEditor(false);
    setShowToolBar(true);
  }

  const onNodeClick = (event, node) => {
    setOpenEditor(true);
    event.preventDefault();
    setNodeName(node.data.label);
  };

  const onEdgeUpdateStart = (_event, edge) => {
    // Create a new node at the current pointer position
    debugger;
    console.log(edge);
    const newNode = {
      id: `node_${nodes.length + 1}`,
      position: edge.targetPosition,
      data: { label: `Message ${nodes.length + 1}` },
    };

    // Add the new node to the nodes array
    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  const onEdgeUpdate = (oldEdge, newConnection) => {
    debugger;
    // Update the dragged edge to connect to the new node
    const updatedEdge = {
      ...oldEdge,
      target: newConnection.target,
      targetPosition: newConnection.target,
    };
  
    // Update the edges array with the updated edge
    setEdges((prevEdges) =>
      prevEdges.map((edge) => (edge.id === oldEdge.id ? updatedEdge : edge))
    );
  };

  const autoLayout = () => {
    const laidOutNodes = layoutNodesAndEdges(nodes, edges);
    setNodes(laidOutNodes);
  };

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.selected === true) {
          debugger;
          node.data = {
            ...node.data,
            label: nodeName,
          };

          // node.style={...node.style, height:sizeY}
          // node.style={...node.style, width:sizeX}
        }

        return node;
      }),
    );
  }, [nodeName, setNodes]);

  return (
    <div className="sm:ml-64 mt-10" style={{ height: "calc(100vh - 64px)" }}>
      <Navbar exportJson={exportJson} autoLayout={autoLayout} />
      <ReactFlowProvider>
        <div className="reactflow-wrapper w-full h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            defaultViewport={defaultViewport}
            edgeTypes={SmoothStepEdge}
            connectionLineComponent={ConnectionLine}
            connectionLineType={ConnectionLineType.SimpleBezier}
            onPaneClick={onPaneClick}
            onNodeClick={onNodeClick}
            onEdgeUpdateStart={onEdgeUpdateStart}
            onEdgeUpdate={onEdgeUpdate}
            onNodeDragStart={(event, node) => {
              event.preventDefault();
              setNodeName(node.data.label);
            }}
            // fitView
          >
            {openEditor && (
              <>
                <aside
                  id="cta-button-sidebar"
                  className="fixed top-0 right-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
                  aria-label="Sidebar"
                >
                  <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                    <div
                      id="dropdown-cta"
                      className="p-4 mt-6 rounded-lg bg-blue-50 dark:bg-blue-900"
                    >
                      <div className="flex items-center mb-3">
                        <button
                          type="button"
                          className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 inline-flex justify-center items-center w-6 h-6 text-blue-900 rounded-lg focus:ring-2 focus:ring-blue-400 p-1 hover:bg-blue-200 h-6 w-6 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800"
                          data-dismiss-target="#dropdown-cta"
                          aria-label="Close"
                          onClick={() => setOpenEditor(false)}
                        >
                          <span className="sr-only">Close</span>
                          <svg
                            className="w-2.5 h-2.5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 14"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                          </svg>
                        </button>
                      </div>

                      <div>
                        <label
                          htmlFor="first_name"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Selected Node
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          onChange={(evt) => setNodeName(evt.target.value)}
                          value={nodeName}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                      </div>

                      <a
                        className="text-sm text-blue-800 underline font-medium hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        href="#"
                      >
                        Selected ID: {id}
                      </a>
                    </div>
                  </div>
                </aside>
              </>
            )}
            <Controls showInteractive />
            <MiniMap style={minimapStyle} zoomable pannable />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
      {showSettingBar && (
        <SettingBar
          setShowSettingBar={setShowSettingBar}
          setShowToolBar={setShowToolBar}
          selectedNodeData={selectedNodeData}
          variables={variables}
          setVariables={setVariables}
        />
      )}
      {showToolBar && <Toolbar setShowToolBar={setShowToolBar}/>}
    </div>
  );
};

export default Main;