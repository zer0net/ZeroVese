export const SitesReducerInitialState = {
  sites:null
}

function AppReducer(state,action){
  switch(action.type){
    case 'SET_SITES':{
      return {... state, sites:action.sites}
    }
  }
}

export default AppReducer;
