import React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}
export const Image: React.FC<ImageProps> = (props) => {
  const { src } = props;

  return React.createElement("img", {
    ...props,
    src: src ? chrome.runtime.getURL(src) : src
  });
}

