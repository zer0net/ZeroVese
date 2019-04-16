import React, { useState } from 'react';
import { GenerateBlogQuery, getBlogAvatarImage } from '../helpers';

function BlogList(){

    const [ blogs, setBlogs ] = useState();
    
    React.useEffect(() => {
        Page.cmd('dbQuery',[GenerateBlogQuery()],function(res){
            setBlogs(res);
        });
    },[])
  
    let blogsDisplay;
    if (blogs){
      blogsDisplay = blogs.map((b,index) => (
          <BlogListItem key={index} blog={b} />
      ));
    }

    return (
        <div id="blog-list">
            <h2>New Blogs</h2>
            <ul>
                {blogsDisplay}
            </ul>
        </div>
    )
}

function BlogListItem(props){
    const b = props.blog;
    let blogImageDisplay = getBlogAvatarImage(b);
    return (
        <li className="blog-list-item">
            {blogImageDisplay}
                <a href={"/"+b.blog_id}>{b.blog_title}</a>
        </li>        
    )
}

export default BlogList;