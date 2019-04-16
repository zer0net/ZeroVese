import React, { useState } from 'react';
import {Context} from '../context-provider.js';
import PostList, { Post } from './posts';
import BlogList from './blogs';
import {LatestCommentList} from './comments';
import { Loading } from './partials.js';
import {GeneratePostsQuery} from '../helpers.js';


function ViewContainer(){
    const { appState } = React.useContext(Context);
    let viewDisplay;
    if (appState.route.view === 'main') viewDisplay = <MainView/>
    else if (appState.route.view === 'post'){ viewDisplay = <PostView /> }
    return (
        <div id="view-container">
            {viewDisplay}
        </div>
    )
}

function MainView(){
    return (
        <div id="main-view" className="view-port">
            <div id="main-view-blogs">
                <div className="container">
                    <BlogList/>
                </div>
            </div>
            <div id="content-container">
                <div className="container">
                    <div id="content">
                        <PostList/>
                    </div>
                    <div id="sidebar">
                        <LatestCommentList/>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PostView(){

    const { appState } = React.useContext(Context);
    const [ post, setPost ] = useState('');
  
    React.useEffect(() => {
        const query = GeneratePostsQuery(appState.route.id)
        window.Page.cmd('dbQuery',[query],function(res){
            setPost(res[0]);
        });
    },[])
  
    let postViewDisplay = <Loading/>
    if (post) postViewDisplay = <Post post={post}/>
  
    return (
        <div id="post-view" className="view-port">
            <div id="content-container">
                <div className="container">
                    <div id="content">
                        {postViewDisplay}
                    </div>
                </div>
            </div>
        </div>
    );
  }
  

export default ViewContainer;