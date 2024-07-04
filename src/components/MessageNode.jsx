import React, { memo, useState, useRef, useEffect } from "react";
import { Handle, Position } from "reactflow";

function MessageNode(props) {
  const [showToolbar, setShowToolbar] = useState(false);
  const wrapperRef = useRef(null);

  const { id, xPos, yPos, data } = props;
  const { setNodes, label, getId, selectNode, nodedata } = data;

  /**
   * Delete node by click trash
   */
  const deleteNodeById = () => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
  };

  const useOutsideAlerter = (ref) => {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowToolbar(false);
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };
  useOutsideAlerter(wrapperRef);

  /**
   * Add new node by click +
   */
  const addNewNode = () => {
    const position = {
      x: xPos + 10,
      y: yPos + 10,
    };

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
        nodedata["media_name"] = "";
        nodedata["media_content"] = null;
        break;
      case "Talk with advisor":
        nodedata["advisor_name"] = "Joh  Doe";
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
        break;
    }
    const edgeStyle = {
      stroke: "#8C9491",
      strokeWidth: 5,
      strokeDasharray: "10 10",
    };
    const newNode = {
      id: getId(),
      type: "customNode",
      position,
      data: { label: `${label}`, setNodes, getId, selectNode, nodedata },
      style: edgeStyle,
      animated: false,
    };
    setNodes((nds) => nds.concat(newNode));
    setShowToolbar(false);
  };

  /**
   * When click node handler
   */
  const onSelectedNode = () => {
    setShowToolbar(true);
    selectNode(props);
  };
  /**
   * Select ratio option in node
   */
  const selectOption = (s_no, o_no) => {
    nodedata.data[s_no].selectedOption = o_no;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = {
            ...node.data,
            nodedata: { ...nodedata },
          };
        }
        return node;
      }),
    );
  };

  return (
    <>
      {showToolbar && (
        <div
          className="flex absolute -top-6 border-2 border-gray-400 rounded-lg p-1 px-2"
          style={{ fontSize: 12 }}
          ref={wrapperRef}
        >
          <i
            className="fa fa-trash cursor-pointer"
            onClick={deleteNodeById}
          ></i>
          <i
            className="fa fa-plus cursor-pointer ml-2"
            onClick={addNewNode}
          ></i>
        </div>
      )}
      <div
        className="border-2 border-gray-400 rounded-lg bg-white cursor-pointer w-44"
        onClick={onSelectedNode}
      >
        <Handle
          type="target"
          position={Position.Right}
          id="web-service"
          style={{
            border: "5px solid #8C9491", // Set the border
          }}
        />
        <p className="text-xs font-bold border-b border-gray-400 p-2 flex">
          <img
            src="imgs/message-icon.png"
            className="h-5 mr-2"
            alt="A"
            width={20}
          />
          Message
        </p>
        <p className="text-[#aaa]">
                  <i>Continue</i>
                  <br />
                </p>
      </div>
    </>
  );
}

export default memo(MessageNode);
