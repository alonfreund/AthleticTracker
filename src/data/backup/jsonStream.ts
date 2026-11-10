import { JSONParser, TokenType } from '@streamparser/json'
import { BACKUP_TABLES } from '../db/database'
import { BACKUP_CHUNK_BYTES, MAX_BACKUP_ROW_BYTES, assertBackupSize } from './limits'
export type BackupFile = Pick<Blob,'size'|'slice'>
type Frame={object:boolean;path:string[];keys:Set<string>;expectKey:boolean;key?:string;index:number}
/** Grammar comes from the JSON parser; guards bound memory and reject duplicate/unsafe keys. */
export async function streamBackupJson(file: BackupFile, rows: (table:string,value:unknown)=>void, flush:()=>Promise<void>, signal?:AbortSignal, progress?:(bytes:number)=>void) {
  assertBackupSize(file.size)
  const header:Record<string,unknown>=Object.create(null)
  const tables=new Set<string>(),rootKeys=new Set<string>(),frames:Frame[]=[]
  const parser=new JSONParser({paths:['$.format','$.formatVersion','$.exportedAt','$.appVersion','$.data.*.*'],keepStack:false,emitPartialTokens:true,stringBufferSize:64*1024,numberBufferSize:1024})
  let rowStart:number|undefined,ended=false,read=0
  const decoder=new TextDecoder('utf-8',{fatal:true})
  parser.onToken=({token,value,offset,partial})=>{
    const top=frames.at(-1)
    if(typeof value==='string' && value.length>(top?.expectKey?200:MAX_BACKUP_ROW_BYTES)) throw new Error('A backup token is too large.')
    if(partial) {if(read-offset>MAX_BACKUP_ROW_BYTES)throw new Error('A backup token exceeds the 1 MB safety limit.');return}
    if(rowStart!==undefined && offset-rowStart+1>MAX_BACKUP_ROW_BYTES) throw new Error('A backup record exceeds the 1 MB safety limit.')
    if(token===TokenType.COLON) return
    if(token===TokenType.COMMA) {if(top?.object)top.expectKey=true;return}
    if(token===TokenType.RIGHT_BRACE || token===TokenType.RIGHT_BRACKET) {
      const closed=frames.pop()
      if(closed?.path.length===3) rowStart=undefined
      return
    }
    if(top?.object && top.expectKey && token===TokenType.STRING) {
      const key=String(value)
      if(top.keys.has(key)) throw new Error('Backup contains a duplicate JSON key.')
      if(['__proto__','constructor','prototype'].includes(key)) throw new Error('Unsupported JSON key.')
      top.keys.add(key);top.key=key;top.expectKey=false
      if(top.path.length===0) {if(!['format','formatVersion','exportedAt','appVersion','data'].includes(key))throw new Error('Unsupported backup field.');rootKeys.add(key)}
      if(top.path.length===1 && top.path[0]==='data' && !(BACKUP_TABLES as readonly string[]).includes(key))throw new Error('Unsupported backup table.')
      return
    }
    const path=top?[...top.path,top.object?String(top.key):String(top.index++)]:[]
    if(top?.object)top.key=undefined
    if(path.length===0 && token!==TokenType.LEFT_BRACE) throw new Error('Expected a backup object.')
    if(path.length===1) {
      if(path[0]==='data' ? token!==TokenType.LEFT_BRACE : [TokenType.LEFT_BRACE,TokenType.LEFT_BRACKET].includes(token)) throw new Error('Invalid backup envelope.')
    }
    if(path.length===2 && path[0]==='data') {if(token!==TokenType.LEFT_BRACKET)throw new Error('Backup tables must be arrays.');tables.add(path[1])}
    if(path.length===3 && path[0]==='data') {if(token!==TokenType.LEFT_BRACE)throw new Error('Backup records must be objects.');rowStart=offset}
    if(token===TokenType.LEFT_BRACE || token===TokenType.LEFT_BRACKET) {
      if(frames.length>=32)throw new Error('Backup nesting is too deep.')
      frames.push({object:token===TokenType.LEFT_BRACE,path,keys:new Set(),expectKey:true,index:0})
    }
  }
  parser.onValue=({value,key,stack,partial})=>{
    if(partial)return
    if(stack.length===1 && typeof key==='string') {
      if(typeof value==='string' && value.length>200)throw new Error('Invalid backup header.')
      if(key==='formatVersion' && ![1,2,3,4].includes(value as number))throw new Error('Unsupported backup version.')
      header[key]=value
    } else if(stack.length===3 && typeof key==='number') rows(String(stack[2].key),value)
  }
  parser.onEnd=()=>{ended=true}
  for(let offset=0;offset<file.size;offset+=BACKUP_CHUNK_BYTES) {
    signal?.throwIfAborted()
    const bytes=new Uint8Array(await file.slice(offset,offset+BACKUP_CHUNK_BYTES).arrayBuffer())
    read+=bytes.byteLength;assertBackupSize(read)
    parser.write(decoder.decode(bytes,{stream:true}))
    if(rowStart!==undefined && read-rowStart>MAX_BACKUP_ROW_BYTES+BACKUP_CHUNK_BYTES)throw new Error('A backup record exceeds the 1 MB safety limit.')
    await flush();progress?.(read)
  }
  if(read!==file.size)throw new Error('Backup could not be read completely.')
  const tail=decoder.decode();if(tail)parser.write(tail)
  if(!parser.isEnded)parser.end()
  await flush();signal?.throwIfAborted()
  if(!ended || frames.length || rootKeys.size!==5)throw new Error('The selected backup is incomplete.')
  return {header,tables:[...tables]}
}
