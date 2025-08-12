import { useState } from "react";
import Button from "../components/Button";

interface Props {
  children: string;
  maxChars?: number;
}

const ExpandableText = ({ children, maxChars = 100 }: Props) => {
  if (children.length <= maxChars) return <div>{children}</div>;

  const [isExpanded, setIsExpanded] = useState(false);
  const text = isExpanded ? children : children.substring(0, maxChars);

  return (
    <div>
      <p>
        {text}
        {isExpanded ? "" : "..."}
      </p>
      <Button
        className="my-button-style info"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "Read Less" : "Read More"}
      </Button>
    </div>
  );
};

export default ExpandableText;
