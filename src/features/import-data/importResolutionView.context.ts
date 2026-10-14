import { createContext } from 'react'
/** Optional view defaults, supplied only by the isolated development playground. */
export const ImportResolutionView = createContext<{identityMode:'existing'|'new';sharedValueExpanded:boolean}>({identityMode:'existing',sharedValueExpanded:false})
