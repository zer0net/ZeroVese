import React, {useState } from 'react';
import {Context} from '../context-provider.js';
import {HashCode, IntToRGB,DateHelper} from '../helpers.js';
import Avatars from '@dicebear/avatars';
import GridySprites from '@dicebear/avatars-gridy-sprites';
import { GenerateLatestCommentsQuery, GeneratePostCommentListQuery } from '../helpers.js';
import {Loading} from './partials.js';

function CommentsContainer() {
    return (
      <div id="comments-container">
        <CommentForm/>
        <CommentList/>
      </div>
    )
  }
  
  function CommentForm(props) {
  
    const { zeroNetState, appState, commentDispatch } = React.useContext(Context);
    const [commentBody, setCommentBody] = useState("");
    let parent;
    if (props.parent) parent = props.parent;
  
    function onCreateComment(){
      const inner_path = "data/users/"+zeroNetState.site_info.auth_address;
      window.Page.cmd('fileGet',{
        inner_path:inner_path + "/data.json",
        required:false
      },function(data){
  
        data = JSON.parse(data);
        if (data){
          if (!data.comment){
            data.comment = [];
            data.next_comment_id = 1;
          }
        } else {
          data = {
            "comment":[],
            "next_comment_id":1
          }
        }
  
        const comment = {
          comment_id:"b"+zeroNetState.site_info.address+"u"+zeroNetState.site_info.auth_address+"c"+data.next_comment_id,
          comment_post_id:appState.route.id,
          comment_user_id:zeroNetState.site_info.cert_user_id,
          comment_blog_id:zeroNetState.site_info.address,
          comment_body:commentBody,
          comment_body_parsed:commentBody.replace(/<(?:.|\n)*?>/gm, ''),
          comment_date_added:Date.now()
        }
  
        if (parent) comment.comment_parent_id = parent.comment_id;
  
        data.comment.push(comment);
        data.next_comment_id += 1;
  
        const json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        window.Page.cmd("fileWrite", [inner_path  + "/data.json", btoa(json_raw)], function(res) {
          window.Page.cmd("sitePublish",{"inner_path":inner_path  + "/data.json"}, function(res) {
            setCommentBody("");
            commentDispatch({type:'ADD_COMMENT_TO_THREAD',comment:comment});
            if (appState.settings.share_blog) UpdateZeroVerseClusterDataJson(data,zeroNetState.site_info.auth_address,'comment');
          });
        });
      });
    }
  
    function selectCert(){
      Page.cmd("certSelect",[]);    
    }
  
    let selectedUserNameDisplay = <span>please <a onClick={selectCert}>login</a> to comment</span>, textareaDisabledStatus = "disabled";
    if (zeroNetState.site_info.cert_user_id){
      selectedUserNameDisplay = <span> comment as <a onClick={selectCert}>{zeroNetState.site_info.cert_user_id}</a></span>
      textareaDisabledStatus = "";
    }
  
    let submitCommentButton = <a className="button disabled">Comment</a>
    if (commentBody.length > 2) submitCommentButton = <a onClick={onCreateComment} className="button">Comment</a>
  
    return (
      <div className="comment-form">
        {selectedUserNameDisplay}
        <textarea disabled={textareaDisabledStatus} value={commentBody} onChange={(e) => setCommentBody(e.target.value)}></textarea>
        {submitCommentButton}
      </div>
    )
  }
  
  function CommentList() {
  
    const { appState } = React.useContext(Context);
    const [ comments, setComments ] = useState('');
  
    React.useEffect(() => {
      const query = GeneratePostCommentListQuery(appState.route.id);
      window.Page.cmd('dbQuery',[query],function(res){
        // commentDispatch({type:'SET_COMMENTS',comments:res})
        setComments(res)
        scrollDownToAnchoredComment();
      });
    },[]);
  
    function scrollDownToAnchoredComment(){
      const anchoredComment = document.getElementById(appState.route.anchor);
      if (anchoredComment){
        anchoredComment.classList.add('highlight');
        anchoredComment.scrollIntoView();
        setTimeout(function(){  anchoredComment.classList.remove('highlight'); }, 3000); 
      }
    }
  
    let commentListDisplay = <Loading/>
    if (comments){
          commentListDisplay = comments.map((c,index) => {
            if (!c.comment_parent_id){
              return (
                <CommentListItem
                  key={index}
                  comment={c}
                  comments={comments}
                />
              )
            }
          }
        )
    }
  
    return (
      <div id="comment-list">
        {commentListDisplay}
      </div>
    )
  }
  
  const CommentListItem = (props) => {
    const {zeroNetState, appState} = React.useContext(Context);
    const c = props.comment;
    const [ showForm, setShowForm] = useState(false);
    let options = {colorful:true};
    let avatars = new Avatars(GridySprites(options));
    let svg = avatars.create(c.comment_user_id);
    let usernameColor = '#' + IntToRGB(HashCode(c.comment_user_id));
  
    function toggleFormVisibility(){
      const showFromNewValue = showForm ? false : true;
      setShowForm(showFromNewValue)
    }
  
    let commentReplyButtonContainerDisplay;
    if (zeroNetState.site_info.auth_address){
      commentReplyButtonContainerDisplay = (
        <div onClick={toggleFormVisibility} className="comment-reply-button-container">
          <div className="icon icon-reply"></div>
          <span>Reply</span>
        </div>
      )
    }
  
    let commentReplyFormContainer;
    if (showForm) commentReplyFormContainer = <CommentForm parent={c} onFinishPostingComment={toggleFormVisibility}/>
  
    // const commentListItemHighlightedClass = appState.route.anchor === c.comment_id ? "highlight" : "";  
  
    return (
      <div className={"comment-list-item "} id={c.comment_id}>
        <div className="comment-item-header">
          <figure dangerouslySetInnerHTML={{__html: svg}}></figure>
          <span className="comment-item-user" style={{"color":usernameColor}}>{c.comment_user_id.split('@')[0]} </span>
          <span className="comment-item-date"> - {DateHelper(c.comment_date_added)}</span>
          {commentReplyButtonContainerDisplay}
        </div>
        <div className="comment-item-content">
          <div dangerouslySetInnerHTML={{__html: c.comment_body_parsed}}></div>
        </div>
        {commentReplyFormContainer}
        <CommentItemReplyList
          borderColor={usernameColor}
          parentId={c.comment_id}
          comments={props.comments}
        />
      </div>
    )
  }
  
  function CommentItemReplyList(props){
    
    let replies = [];
    if (props.comments){
      props.comments.forEach(comment => {
        if (comment.comment_parent_id === props.parentId) replies.push(comment);
      });
    }
  
    let replyListDisplay;
    if (replies.length > 0){
      const replyList = replies.map((r,index) => (
        <CommentListItem 
          key={props.parentId + index}
          comment={r}
        />
      ))
      replyListDisplay = <ul style={{"borderColor":props.borderColor}}>{replyList}</ul>
    }
    
    return (
      <div className="comment-item-reply-container">
        {replyListDisplay}
      </div>
    )
  }
  
export function LatestCommentList(){
    const [ comments, setComments ] = useState('');
    React.useEffect(() => {
        Page.cmd('dbQuery',[GenerateLatestCommentsQuery()],function(res){
            setComments(res);
        });
    },[]);

    let commentsDisplay;
    if (comments){
        const commentList = comments.map((cm,index) => (
            <LatestCommentListItem key={index} comment={cm}/>
        ));
        commentsDisplay = <ul>{commentList}</ul>
    }
    return (
        <div id="comment-list">
            <h2>Comments</h2>
            {commentsDisplay}
        </div>
    )
}

function LatestCommentListItem(props){
    const cm = props.comment;
    let options = {colorful:true};
    let avatars = new Avatars(GridySprites(options));
    let svg = avatars.create(cm.comment_user_id);
    let usernameColor = '#' + IntToRGB(HashCode(cm.comment_user_id));
    return (
        <li>
            <div className="latest-comment-item-header">
                <figure dangerouslySetInnerHTML={{__html: svg}}></figure> <span style={{"color":usernameColor}}>{cm.comment_user_id.split('@')[0]}</span>
            </div>
            <div className="latest-comment-item-body" style={{"borderColor":usernameColor}}>
                {cm.comment_body}          
            </div>
            <div className="latest-comment-item-footer">
                <a href={"index.html?v:post+id:"+cm.comment_post_id}>@{cm.post_title}</a>            
            </div>
        </li>
    )
}  

export default CommentsContainer;