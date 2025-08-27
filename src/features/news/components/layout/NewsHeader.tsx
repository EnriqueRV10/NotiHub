import React from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface NewsHeaderProps {
  onCreateNews: () => void;
  isCreating?: boolean;
  title?: string;
}

export default function NewsHeader({
  onCreateNews,
  isCreating = false,
  title = "Noticias",
}: NewsHeaderProps) {
  return (
    <div className="flex flex-row justify-between items-center mt-4">
      <h1 className="text-black font-bold text-lg">NotiHub</h1>
      <Button
        type="primary"
        shape="round"
        icon={<PlusOutlined />}
        onClick={onCreateNews}
        loading={isCreating}
        disabled={isCreating}
      >
        Nueva Noticia
      </Button>
    </div>
  );
}
