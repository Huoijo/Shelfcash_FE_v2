import {createContext} from 'react'
export type ImportEntityKind='product'|'ingredient'|'supplier'
export type ImportEntityCandidate={id:string;name:string;code:string|null;kind:ImportEntityKind}
export type ImportEntitySearch=(request:{storeId:string;kind:ImportEntityKind;q:string;cursor?:string;signal:AbortSignal})=>Promise<{items:ImportEntityCandidate[];nextCursor:string|null}>
/** Isolated DEV sessions can inject sample results; production always uses scoped readers. */
export const ImportEntitySearchContext=createContext<ImportEntitySearch|null>(null)
