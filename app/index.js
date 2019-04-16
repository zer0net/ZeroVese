import React from 'react';
import ReactDOM from 'react-dom';
import StoreContextProvider,{Context} from './context-provider.js';
import {RouteHelper, generateMissingSiteList } from './helpers.js';
import {Loading} from './components/partials.js';
import Template from './components/template.js';

function App(){

  /** Component **/

  // context
  const { zeroNetState,zeroNetDispatch, appState,appDispatch} = React.useContext(Context);
  
  // component did mount
  React.useEffect(() => { initApp() },[]);

  // initialize app
  function initApp(){
    // siteInfo
    window.Page.cmd('siteInfo', {}, function(site_info) {
      zeroNetDispatch({type:'SET_SITE_INFO',site_info});
      // serverInfo
      window.Page.cmd('serverInfo', {},function(server_info){
        zeroNetDispatch({type:'SET_SERVER_INFO',server_info});
        // get user feed
        window.Page.cmd('feedListFollow',[],function(user_feed){
          zeroNetDispatch({type:'SET_USER_FEED',user_feed})
          // zeronet ready
          zeroNetDispatch({type:'SET_READY'});
        });
      });
    });
  }

  // on zeronet state ready
  React.useEffect(() => {
    if (zeroNetState.ready) checkMergerPermissions();
  },[zeroNetState.ready])


  // check merger permissions
  function checkMergerPermissions() {
    if (zeroNetState.site_info.settings.permissions.indexOf('Merger:ZeroVerse') > -1) getMergerSites();
    else Page.cmd('wrapperPermissionAdd', 'Merger:ZeroVerse', function(res) { getMergerSites(); });
  }

  // get merger sites
  function getMergerSites(){
    Page.cmd("mergerSiteList", {query_site_info: true}, function(res) {
      const missingSiteList = generateMissingSiteList(res);
      if (missingSiteList.length > 0) addMergerSites(missingSiteList);
      else finishLoadingApp();
    });
  }

  // add merger sites
  function addMergerSites(missingSiteList){
    Page.cmd("mergerSiteAdd",{"addresses":missingSiteList},function(data){
      Page.cmd("wrapperNotification", ["info", "refresh this site to view new content", 10000]);
    });
  }

  // finish loading app
  function finishLoadingApp(){
    const route = RouteHelper(window.location.href,zeroNetState.site_info.address);
    appDispatch({type:'SET_ROUTE',route:route});
    appDispatch({type:'FINISH_LOADING_SITE'});
    setOnRequestListener();
  }

  // set on request listener for cert change
  function setOnRequestListener(){
    window.Page.onRequest = (function(cmd, message) {
      if (cmd == "setSiteInfo") {
        if (message.event && message.event[0] === "cert_changed"){
          const site_info = {
            ... zeroNetState.site_info,
            auth_address:message.auth_address,
            cert_user_id:message.cert_user_id
          }
          zeroNetDispatch({type:'SET_SITE_INFO',site_info});
        }
      }
    });    
  }

  /** Render **/

  // app display
  let appDisplay = <div id="main-loading"><Loading msg={"Loading Zite"}/></div>
  if (!appState.loading){
    appDisplay = <Template/>
  }

  return (
    <main id="main">
      {appDisplay}
    </main>
  )
}

function AppContainer(){
  return (
    <StoreContextProvider>
      <App/>
    </StoreContextProvider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<AppContainer />, rootElement);
