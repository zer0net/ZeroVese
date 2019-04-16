import React from 'react';
import ZeroNetReducer,{ZeroNetReducerInitialState} from './reducers/zeronet-reducer.js';
import AppReducer,{AppReducerInitialState} from './reducers/app-reducer.js';
import SitesReducer, {SitesReducerInitialState} from './reducers/sites-reducer.js';

export const Context = React.createContext();
const Provider = Context.Provider;

const StoreContextProvider = (props) => {
  const [zeroNetState,zeroNetDispatch] = React.useReducer(ZeroNetReducer,ZeroNetReducerInitialState);
  const [appState, appDispatch] = React.useReducer(AppReducer,AppReducerInitialState);
  const [sitesState, sitesDispatch] = React.useReducer(SitesReducer,SitesReducerInitialState);

  return(
    <Provider {...props} value={{
      zeroNetState,zeroNetDispatch,
      appState,appDispatch,
      sitesState, sitesDispatch
    }}/>
  )
}

export default StoreContextProvider;
