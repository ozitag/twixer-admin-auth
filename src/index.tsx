import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

const nodeElement = document.getElementById('root');

if (nodeElement) {
    ReactDOM.render(
        <React.StrictMode>
            <App/>
        </React.StrictMode>,
        nodeElement
    );
}
