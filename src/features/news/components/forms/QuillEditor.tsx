"use client";

import React from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const DynamicQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

const toolbarOptions = [
  [{ font: [] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ align: [] }],
  [{ color: [] }, { background: [] }],
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],
  ["clean"],
];

const QuillEditor = ({
  value,
  onChange,
  height = "500px",
}: QuillEditorProps) => {
  return (
    <div style={{ height }}>
      <DynamicQuill
        theme="snow"
        modules={{ toolbar: toolbarOptions }}
        value={value}
        onChange={onChange}
        style={{ height: "100%" }}
      />

      <style jsx>{`
        div :global(.ql-container) {
          height: calc(100% - 42px);
        }

        div :global(.ql-editor) {
          height: 100%;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default QuillEditor;
