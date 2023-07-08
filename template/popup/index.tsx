import React from "react";
import ReactDOM from "react-dom";

const App: React.FC = () => {
  return <div>
    Welcome to the popup page for {{app_name}}
  </div>
}

const root = document.createElement("div");
root.id = "#{{app_name}}";
ReactDOM.render(<App />, root);

