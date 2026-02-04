import ReactDOM from "react-dom/client";
import App from "./App";
// import styles from './index.css?inline';
import "./index.css";

ReactDOM.createRoot(
  (() => {
    // const container = document.createElement('div');
    // container.id = 'doubao-downloader-container';
    // document.body.appendChild(container);

    // const shadowDom = container.attachShadow({ mode: 'open' });

    const app = document.createElement("div");
    app.style.height = "0";

    // const styleElement = document.createElement('style');
    // styleElement.textContent = styles;

    // shadowDom.appendChild(styleElement);
    // shadowDom.appendChild(app);
    document.body.appendChild(app);

    return app;
  })(),
).render(<App />);
