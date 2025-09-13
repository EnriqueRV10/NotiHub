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
}

const toolbarOptions = [
  [{ font: [] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ align: [] }],
  [{ color: [] }, { background: [] }],

  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],
  // ['link', 'image', 'formula'], //, 'video'],          // add's image support

  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  ["clean"], // remove formatting button
];

const QuillEditor = ({ value, onChange }: QuillEditorProps) => {
  return (
    <div>
      <DynamicQuill
        theme="snow"
        modules={{ toolbar: toolbarOptions }}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default QuillEditor;
