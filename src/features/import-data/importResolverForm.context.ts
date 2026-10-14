import {createContext} from 'react'
export const ResolverForm = createContext<{id:string;valid:(value:boolean)=>void}|null>(null)
