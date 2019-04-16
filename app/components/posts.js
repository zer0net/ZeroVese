import React, {useState } from 'react';
import { GeneratePostsQuery, DateHelper , GenerateIsLikedByUserQuery , scanForMediaInPostBody , getBlogAvatarImage } from '../helpers.js';
import {Context} from '../context-provider.js';
import CommentsContainer from './comments.js';

export function PostList(){

    const [ posts, setPosts ] = useState();
    
    React.useEffect(() => {
      Page.cmd('dbQuery',[GeneratePostsQuery()],function(res){
        setPosts(res);
      });
    },[])
  
    let postsDisplay;
    if (posts){
      postsDisplay = posts.map((p,index) => (
        <Post key={index} post={p}/>
      ));
    }
  
    return (
      <div id="main-view" className="view-port">
        <ul>
          {postsDisplay}
        </ul>
      </div>
    )
}

export const Post = (props) => {

  const { appState } = React.useContext(Context);

  let commentsDisplay;
  if (appState.route.view === 'post') commentsDisplay = <CommentsContainer post={props.post} />

  const postBodyHtml = scanForMediaInPostBody(props.post);
  return (
    <div className="post" id={"post-"+props.post.post_id}>
        <PostHeader
          post={props.post}
        />
        <article dangerouslySetInnerHTML={{__html: postBodyHtml }}></article>
        {commentsDisplay}
    </div>
  );
}

const PostHeader = (props) => {

  const { zeroNetState  } = React.useContext(Context);

  const post = props.post;

  let commentCount = "0";
  if (post.comment_count) commentCount = post.comment_count;

  let blogImageDisplay = getBlogAvatarImage(post);

  return (
    <div className="post-header">
      <h2><a href={"index.html?view:post+id:"+post.post_id}>{post.post_title}</a></h2>
      <div className="post-subheader">
        <span className="date-added">on {DateHelper(post.post_date_added)} </span>
        <span className="post-blog">in {blogImageDisplay} <a href={post.blog_id}>{post.blog_title}</a></span>
        <span className="comment-count"><div className="icon-comment"></div><span>{commentCount} comments </span></span>
        <span className="like-count">
          <PostHeaderLikeContainer post={post}/>    
        </span>        
      </div>
    </div>
  )
}

function PostHeaderLikeContainer(props){

  const { zeroNetState  } = React.useContext(Context);
  const post = props.post;
  let likeCountValue = 0;
  if (post.like_count) likeCountValue = post.like_count;
  const [ likeCount, setLikeCount ] = useState(likeCountValue);
  const [ userLike, setUserLike ] = useState(false);

  React.useEffect(() => {
    const query = GenerateIsLikedByUserQuery(post.post_id,zeroNetState.site_info.cert_user_id)
    window.Page.cmd('dbQuery',[query],function(res){
      if (res.length > 0){
        setUserLike(res);
      } else {
        setUserLike('');
      }
    });    
  },[])

  function togglePostLike(){
    if (zeroNetState.site_info.cert_user_id){
      if (userLike){
        deletePostLike(userLike);
      } else {
        createPostLike()
      }
    } else {
      Page.cmd("wrapperNotification", ["info", "please login to like & comment", 5000]);
    }
  }

  function createPostLike(){

    const inner_path = "merged-ZeroVerse/1EuEDh1WLTrCPHLGrVmazuwEew6w1tKJtA/data/users/"+zeroNetState.site_info.auth_address;
    window.Page.cmd('fileGet',{
      inner_path:inner_path + "/data.json",
      required:false
    },function(data){

      data = JSON.parse(data);
      if (data){
        if (!data.like){
          data.like = [];
          data.next_like_id = 1;
        }
      } else {
        data = {
          "like":[],
          "next_like_id":1
        }
      }

      const like = {
        like_id:"b"+zeroNetState.site_info.address+"u"+zeroNetState.site_info.auth_address+"l"+data.next_like_id,
        like_post_id:post.post_id,
        like_user_id:zeroNetState.site_info.cert_user_id,
        like_blog_id:zeroNetState.site_info.address,
        like_date_added:Date.now()
      }

      data.like.push(like);
      data.next_like_id += 1;

      const json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      window.Page.cmd("fileWrite", [inner_path  + "/data.json", btoa(json_raw)], function(res) {
        window.Page.cmd("sitePublish",{"inner_path":inner_path  + "/data.json"}, function(res) {
          setLikeCount(likeCount + 1);
          setUserLike(like);
        });
      });
    });
  }

  function deletePostLike(like){

    const inner_path = "merged-ZeroVerse/1EuEDh1WLTrCPHLGrVmazuwEew6w1tKJtA/data/users/"+zeroNetState.site_info.auth_address;
    window.Page.cmd('fileGet',{
      inner_path:inner_path + "/data.json",
      required:false
    },function(data){
      data = JSON.parse(data);
      const likeIndex = data.like.findIndex((l) => l.like_id === like.like_id);
      data.like.splice(likeIndex,1);
      const json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      window.Page.cmd("fileWrite", [inner_path  + "/data.json", btoa(json_raw)], function(res) {
        window.Page.cmd("sitePublish",{"inner_path":inner_path  + "/data.json"}, function(res) {
          setLikeCount(likeCount - 1);
          setUserLike('');
        });
      });
    });
  }

  const heartColorCssClass = userLike ? "red" : "";
  
  return (
    <a onClick={togglePostLike}>
      <div className={"icon-heart icon-heart-anim " + heartColorCssClass}></div>
      {likeCount}
    </a>
  )
}

export default PostList;
  