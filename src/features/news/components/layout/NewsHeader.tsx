import React from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface NewsHeaderProps {
  onCreateNews: () => void;
  isCreating?: boolean;
  title?: string;
}

export const NewsHeader: React.FC<NewsHeaderProps> = ({
  onCreateNews,
  isCreating = false,
  title = "Noticias",
}) => {
  return (
    <div className="flex flex-row justify-between items-center mt-4">
      <h1 className="text-black font-bold text-lg">
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
      </h1>
    </div>
  );
};
