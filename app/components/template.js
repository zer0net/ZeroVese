import React from 'react';
import ViewContainer from './views.js';

function Template(){
    return (
        <div id="template-container">
            <Header/>
            <ViewContainer/>
        </div>
    )
}

function Header(){
    return (
        <div id="header">
            <div className="container">
                <h1><a href="/1D4irsAzXKkqfkwiadKHEwpbZuQKXvyiTK">ZeroVerse</a></h1>
                <span>ZeroBlog Aggregator</span> 
            </div>
        </div>
    )
}

export default Template;