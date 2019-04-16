import React from 'react';
import Avatars from '@dicebear/avatars';
import GridySprites from '@dicebear/avatars-gridy-sprites';
import JdenticonSprites from '@dicebear/avatars-jdenticon-sprites';

/** GENERAL HELPERS **/

  export const RouteHelper = (url,address) => {
      let view = 'main',id = null;
      if (url.indexOf('?wrapper') > -1) url = url.split('?wrapper')[0];
      if (url.indexOf('&wrapper') > -1) url = url.split('&wrapper')[0];
      const path = url.split(address + "/")[1];
      if (path && path.indexOf('?') > -1){
        view = path.split(':')[1];
        if (path.indexOf('id:') > -1){
          view = view.split('+')[0];
          id = path.split(':')[2];
        }
      }
      return {view:view,id:id}
  }

  export const DateHelper = (timeStamp) => {
    const monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
    const date = new Date(timeStamp);
    return date.getDate() + ' ' + monthNames[date.getMonth()] + ' ' +  date.getFullYear()
  }

/** STRING TO HEX */

  export const HashCode = (str) => { // java String#hashCode
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
  } 

  export const IntToRGB = (i) => {
    const c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
  }

/** SITES */


  // Generate Missing Site List
  export const generateMissingSiteList = (sites) => {
    let sl = [];
    const clusters = ["1EuEDh1WLTrCPHLGrVmazuwEew6w1tKJtA"]
    clusters.forEach(function(cl,index){
      let clusterExists = false;
      for (var i in sites){
        if (cl === sites[i].address) clusterExists = true;
      }
      if (!clusterExists) sl.push(cl);
    });
    return sl;
  }

/** BLOG AVATARS */

  export const getBlogAvatarImage = (b) => {
    let blogImageDisplay;
    if (b.avatar_type){
      if (b.avatar_type === "jDenticon"){
        let avatars = new Avatars(JdenticonSprites());
        let svg = avatars.create(b.avatar_jdenticon_string);
        blogImageDisplay = <figure className="blog-image" dangerouslySetInnerHTML={{__html: svg}}></figure>  
      } else if (b.avatar_type === "Girdy"){
        let avatars = new Avatars(GridySprites());
        let svg = avatars.create(b.avatar_girdy_string);
        blogImageDisplay = <figure className="blog-image" dangerouslySetInnerHTML={{__html: svg}}></figure>
      } else if (b.avatar_type === "Image"){
        const imagePath = "merged-ZeroVerse/"+b.blog_cluster+"/data/users/"+b.blog_user_id+"/"+b.avatar_image;
        blogImageDisplay = <figure className="blog-image"><img src={imagePath}/></figure>
      }
    } else {
      let avatars = new Avatars(JdenticonSprites());
      let svg = avatars.create(b.blog_id);
      blogImageDisplay = <figure className="blog-image" dangerouslySetInnerHTML={{__html: svg}}></figure>
    }
    return blogImageDisplay;
  }

/** POSTS */

export const scanForMediaInPostBody = (post) => {
  let bodyHtml = post.post_body;
  let oTag, cTag, replaceImg = false;
  if (bodyHtml.indexOf('<img src="data/users') > -1 ){
    oTag = '<img src="';
    cTag = '">';
    replaceImg = true;
  }
  if (replaceImg){
    const imgSrc = bodyHtml.split(oTag)[1].split(cTag)[0];
    const beforeSplit = bodyHtml.split(oTag)[0];
    const afterSplit = bodyHtml.split(cTag)[1];
    bodyHtml = beforeSplit + oTag + 'merged-ZeroVerse/' + post.post_blog_id + '/' + imgSrc + cTag + afterSplit;
  }
  return bodyHtml;
}

/** QUERIES **/
  /* SITES */

  export const generateGetSitesQuery = () => {
    let q = "SELECT s.*, sa.*"
    q += " FROM site AS s"
    q += " LEFT JOIN added_site AS sa ON sa.site_id=s.site_id"
    q += " WHERE sa.site_date_saved IS NOT NULL "
    return q;
  }

  /* BLOGS */

    export const GenerateBlogQuery = (blogId) => {
      let q = "SELECT DISTINCT b.* , s.*";
      q += ", (SELECT count(*) FROM post WHERE post.post_blog_id=b.blog_id) as post_count";
      q += ", (SELECT count(*) FROM comment WHERE comment.comment_blog_id=b.blog_id) as comment_count";
      q += ", (SELECT count(*) FROM like WHERE like.like_blog_id=b.blog_id) as like_count";
      q += " FROM blog AS b";
      q += " LEFT JOIN settings AS s ON s.settings_blog_id=b.blog_id"
      q += " GROUP BY b.blog_id";
      q += " ORDER BY b.blog_date_added DESC";
      return q;
    }

  /* POSTS */ 

    export const GeneratePostsQuery = (postId) => {
      let q = "SELECT p.*, b.*, s.*";
      q += ", (SELECT count(*) FROM comment WHERE comment.comment_post_id=p.post_id) as comment_count";
      q += ", (SELECT count(*) FROM like WHERE like.like_post_id=p.post_id) as like_count";
      q += " FROM post AS p"
      q += " LEFT JOIN blog AS b ON p.post_blog_id=b.blog_id"
      q += " LEFT JOIN settings AS s ON b.blog_id=s.settings_blog_id"
      if (postId){
        q += " WHERE p.post_id='"+postId+"'";
      } else {
        q += " ORDER BY p.post_date_added DESC";
      }
      return q;
    }

    export const GenerateIsLikedByUserQuery = (postId, userId) => {
      let q = "SELECT * FROM like "
      q += " WHERE like_post_id='"+postId+"'"
      q += " AND like_user_id='"+userId+"'";
      return q;
    }

  /* COMMENTS */

    // get posts comments
    export const GeneratePostCommentListQuery = (postId) => {
      let q = "SELECT * ";
      q += " FROM comment ";
      q += " WHERE comment_post_id='"+postId+"' ";
      q += " ORDER BY comment_date_added DESC ";
      return q;
    }

    // get latest comments
    export const GenerateLatestCommentsQuery = () => {
      let q = "SELECT c.*, p.post_title ";
      q += " FROM comment AS c";
      q += " LEFT JOIN post AS p WHERE p.post_id=c.comment_post_id"
      q += " ORDER BY c.comment_date_added DESC ";
      q += " LIMIT 5";
      return q;
    }


  /* FEED */

    // follow posts
    export const GenerateFollowZiteQuery = () => {
      let q = "SELECT post_title AS title, post_body_parsed AS body, post_date_added AS date_added, 'post' AS type,";
      q += " 'index.html?view:post+id:' || post.post_id AS url FROM post LEFT JOIN json AS topic_creator_json ON (topic_creator_json.json_id = post.json_id) WHERE parent_topic_uri IS NULL";
      return q;
    }

    // follow post comments
    export const GenerateFollowPostCommentsQuery = (postId) => {
      let q = "SELECT post.post_title AS title, comment.comment_body_parse AS body, comment.comment_date_added AS date_added, 'comment' AS type,";
      q += " 'index.html?view:post+id:' || post.post_id AS url";
      q += " FROM post";
      q += " LEFT JOIN comment ON (comment.comment_post_id = post.post_id)";
      q += " WHERE post.post_id='"+postId+"'";
      return q;
    };

/** QUERIES */